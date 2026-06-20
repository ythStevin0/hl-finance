'use client'

// src/components/transactions/TransactionForm.tsx
// Update fase 4: integrasi BonusGrantSelector
// AC-5.5: multiple bonus dalam 1 bon
// AC-5.7: bonus lines omzet & laba = 0

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTransactionForm } from '@/hooks/useTransactionForm'
import { createTransaction, updateTransaction } from '@/lib/actions/transaction.actions'
import { recordBonusGrant } from '@/lib/actions/bonus.actions'
import type { CustomerWithDiscountMap } from '@/lib/types/transaction'
import type { BonusStatus } from '@/lib/types/bonus'
import type { Product, Customer, DiscountStep } from '@/lib/supabase/types'
import { cascadingDiscount } from '@/lib/calculations'
import NomorBonInput from './NomorBonInput'
import LineItemRow from './LineItemRow'
import TransactionSummaryFooter from './TransactionSummaryFooter'
import BonusGrantSelector from '@/components/bonus/BonusGrantSelector'

interface Props {
  mode: 'new' | 'edit'
  editId?: string
  customers: Customer[]
  products: Product[]
  allDiscountSteps: Record<string, { LM: DiscountStep[]; BR: DiscountStep[] }>
  // Map customer_id → bonus status (untuk BonusGrantSelector)
  bonusStatuses: Record<string, BonusStatus>
  defaultCustomerId?: string
  defaultIsBonus?: boolean
  initialData?: {
    nomorBon: string
    tanggal: string
    customerId: string
    ongkir: number
    deskripsi: string
    isBonus: boolean
    lineItems: Array<{
      product: Product
      qty: number
      discountedUnitPrice: number
      lineOmzet: number
      lineLaba: number
      isFree: boolean
    }>
  }
}

function buildDiscountMap(
  steps: { LM: DiscountStep[]; BR: DiscountStep[] }
): Record<'LM' | 'BR', number[]> {
  return {
    LM: steps.LM.map(s => s.value),
    BR: steps.BR.map(s => s.value),
  }
}

export default function TransactionForm({
  mode,
  editId,
  customers,
  products,
  allDiscountSteps,
  bonusStatuses,
  defaultCustomerId,
  defaultIsBonus = false,
  initialData,
}: Props) {
  const router = useRouter()
  const [isBonus, setIsBonus]                   = useState(initialData?.isBonus ?? defaultIsBonus)
  const [submitError, setSubmitError]           = useState<string | null>(null)
  const [loading, setLoading]                   = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialData?.customerId ?? defaultCustomerId ?? ''
  )
  // AC-5.5: berapa bonus dikonsumsi di bon ini
  const [quantityGranted, setQuantityGranted]   = useState(1)

  const currentDiscountSteps = allDiscountSteps[selectedCustomerId] ?? { LM: [], BR: [] }
  const currentDiscountMap   = buildDiscountMap(currentDiscountSteps)
  const currentBonusStatus   = bonusStatuses[selectedCustomerId] ?? null

  const customerWithDiscounts: CustomerWithDiscountMap | null = selectedCustomerId
    ? {
        customer: customers.find(c => c.id === selectedCustomerId)!,
        discountMap: currentDiscountMap,
      }
    : null

  const form = useTransactionForm({
    customerWithDiscounts,
    isBonus,
    initialState: initialData
      ? {
          nomorBon:   initialData.nomorBon,
          tanggal:    initialData.tanggal,
          customerId: initialData.customerId,
          ongkir:     initialData.ongkir,
          deskripsi:  initialData.deskripsi,
          isBonus:    initialData.isBonus,
          lineItems:  initialData.lineItems.map(item => ({
            draftId:              `draft_${item.product.id}`,
            product:              item.product,
            qty:                  item.qty,
            discountedUnitPrice:  item.discountedUnitPrice,
            lineOmzet:            item.lineOmzet,
            lineLaba:             item.lineLaba,
            isFree:               item.isFree,
          })),
        }
      : { customerId: defaultCustomerId ?? '' },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = form.validate()
    if (validationError) { setSubmitError(validationError); return }

    // Validasi bonus: kalau is_bonus, harus ada bonus tersedia
    if (isBonus && currentBonusStatus && currentBonusStatus.bonusesAvailable === 0) {
      setSubmitError('Pelanggan ini belum punya bonus tersedia.')
      return
    }

    setSubmitError(null)
    setLoading(true)

    const input = {
      nomorBon:   form.nomorBon,
      tanggal:    form.tanggal,
      customerId: selectedCustomerId,
      ongkir:     form.ongkir,
      deskripsi:  form.deskripsi,
      isBonus,
      lineItems:  form.lineItems,
      totalOmzet: form.summary.totalOmzet,
      totalLaba:  form.summary.totalLaba,
    }

    const result = mode === 'new'
      ? await createTransaction(input)
      : await updateTransaction(editId!, input)

    if (!result.success) {
      setSubmitError(result.error ?? 'Terjadi kesalahan.')
      setLoading(false)
      return
    }

    // AC-5.5: record bonus grant setelah bon berhasil dibuat
    if (isBonus && result.id && currentBonusStatus && quantityGranted > 0) {
      await recordBonusGrant({
        customerId:      selectedCustomerId,
        transactionId:   result.id,
        quantityGranted,
      })
    }

    setLoading(false)
    router.push(`/dashboard/transactions/${result.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Nomor Bon + Tanggal */}
      <div className="grid grid-cols-2 gap-4">
        <NomorBonInput
          value={form.nomorBon}
          onChange={form.setNomorBon}
          excludeId={editId}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.tanggal}
            onChange={e => form.setTanggal(e.target.value)}
            className="input-base"
            required
          />
        </div>
      </div>

      {/* Customer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Pelanggan <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCustomerId}
          onChange={e => {
            const newId  = e.target.value
            const steps  = allDiscountSteps[newId] ?? { LM: [], BR: [] }
            const newMap = buildDiscountMap(steps)
            setSelectedCustomerId(newId)
            form.handleCustomerChange(newId, newMap)
            setQuantityGranted(1)
          }}
          className="input-base"
          required
        >
          <option value="">— Pilih Pelanggan —</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.nama}</option>
          ))}
        </select>
      </div>

      {/* Bonus toggle — AC-5.5 */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <input
          type="checkbox"
          id="is_bonus"
          checked={isBonus}
          onChange={e => setIsBonus(e.target.checked)}
          className="w-4 h-4 accent-amber-600"
        />
        <label htmlFor="is_bonus" className="text-sm font-medium text-amber-900 cursor-pointer">
          Bon Bonus — produk diberikan gratis, tidak masuk omzet & laba
        </label>
      </div>

      {/* Bonus Grant Selector — AC-5.5, 5.6 */}
      {isBonus && selectedCustomerId && currentBonusStatus && (
        <BonusGrantSelector
          status={currentBonusStatus}
          quantityGranted={quantityGranted}
          onChange={setQuantityGranted}
        />
      )}

      {/* Line Items */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <div className="col-span-5">Produk</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-4">Harga & Total</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        <div className="px-4">
          {form.lineItems.map(item => (
            <LineItemRow
              key={item.draftId}
              item={item}
              products={products}
              discountMap={currentDiscountMap}
              canRemove={form.lineItems.length > 1}
              onProductChange={productId => {
                const product = productId
                  ? products.find(p => p.id === productId) ?? null
                  : null
                form.updateProduct(item.draftId, product)
              }}
              onQtyChange={qty => form.updateQty(item.draftId, qty)}
              onRemove={() => form.removeLineItem(item.draftId)}
            />
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={form.addLineItem}
            className="text-sm text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Baris
          </button>
        </div>
      </div>

      {/* Ongkir + Deskripsi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ongkir (Rp)</label>
          <input
            type="number"
            value={form.ongkir}
            onChange={e => form.setOngkir(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="input-base"
          />
          <p className="text-xs text-gray-400 mt-1">Pass-through — tidak masuk laba</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <textarea
            value={form.deskripsi}
            onChange={e => form.setDeskripsi(e.target.value)}
            rows={2}
            className="input-base resize-none"
            placeholder="Catatan opsional..."
          />
        </div>
      </div>

      {/* Summary — AC-4.11 */}
      <TransactionSummaryFooter summary={form.summary} showLaba />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="dash-vip-btn" style={{ width: 'auto', padding: '0.6rem 1.25rem' }}>
          {loading
            ? 'Menyimpan...'
            : mode === 'new' ? 'Buat Bon' : 'Simpan Perubahan'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  )
}
