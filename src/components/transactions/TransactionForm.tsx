'use client'

// src/components/transactions/TransactionForm.tsx
// Komponen UI murni — tidak ada business logic di sini (SRP)
// Semua logic ada di useTransactionForm hook
// Semua DB calls ada di transaction.actions.ts

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTransactionForm } from '@/hooks/useTransactionForm'
import { createTransaction, updateTransaction } from '@/lib/actions/transaction.actions'
import type { CustomerWithDiscountMap } from '@/lib/types/transaction'
import type { Product, Customer, DiscountStep } from '@/lib/supabase/types'
import { cascadingDiscount } from '@/lib/calculations'
import NomorBonInput from './NomorBonInput'
import LineItemRow from './LineItemRow'
import TransactionSummaryFooter from './TransactionSummaryFooter'

interface Props {
  mode: 'new' | 'edit'
  editId?: string
  customers: Customer[]
  products: Product[]
  // Map customer_id → discount steps (untuk lookup cepat)
  allDiscountSteps: Record<string, { LM: DiscountStep[]; BR: DiscountStep[] }>
  // Pre-fill untuk edit mode atau dari query param
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

// Build discount map dari steps array
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
  defaultCustomerId,
  defaultIsBonus = false,
  initialData,
}: Props) {
  const router = useRouter()
  const [isBonus, setIsBonus] = useState(initialData?.isBonus ?? defaultIsBonus)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Customer yang dipilih saat ini beserta discount map-nya
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialData?.customerId ?? defaultCustomerId ?? ''
  )

  const currentDiscountSteps = allDiscountSteps[selectedCustomerId] ?? { LM: [], BR: [] }
  const currentDiscountMap = buildDiscountMap(currentDiscountSteps)

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
          nomorBon:  initialData.nomorBon,
          tanggal:   initialData.tanggal,
          customerId: initialData.customerId,
          ongkir:    initialData.ongkir,
          deskripsi: initialData.deskripsi,
          isBonus:   initialData.isBonus,
          lineItems: initialData.lineItems.map(item => ({
            draftId: `draft_${item.product.id}`,
            product: item.product,
            qty: item.qty,
            discountedUnitPrice: item.discountedUnitPrice,
            lineOmzet: item.lineOmzet,
            lineLaba: item.lineLaba,
            isFree: item.isFree,
          })),
        }
      : { customerId: defaultCustomerId ?? '' },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = form.validate()
    if (validationError) { setSubmitError(validationError); return }

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

    setLoading(false)

    if (!result.success) {
      setSubmitError(result.error ?? 'Terjadi kesalahan.')
      return
    }

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

      {/* Row 1: Nomor Bon + Tanggal */}
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
          {/* AC-4.1: default hari ini, bisa diubah */}
          <input
            type="date"
            value={form.tanggal}
            onChange={e => form.setTanggal(e.target.value)}
            className="input-base"
            required
          />
        </div>
      </div>

      {/* Row 2: Customer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Pelanggan <span className="text-red-500">*</span>
        </label>
        {/* AC-4.3: pilih dari list, bukan free text */}
        <select
          value={selectedCustomerId}
          onChange={e => {
            const newId = e.target.value
            const newSteps = allDiscountSteps[newId] ?? { LM: [], BR: [] }
            const newMap = buildDiscountMap(newSteps)
            setSelectedCustomerId(newId)
            form.handleCustomerChange(newId, newMap)
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

      {/* Row 3: Bonus toggle — AC-5.5 */}
      <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
        <input
          type="checkbox"
          id="is_bonus"
          checked={isBonus}
          onChange={e => setIsBonus(e.target.checked)}
          className="w-4 h-4 accent-purple-600"
        />
        <label htmlFor="is_bonus" className="text-sm font-medium text-purple-800 cursor-pointer">
          Bon Bonus — produk diberikan gratis, tidak masuk omzet & laba
        </label>
      </div>

      {/* Row 4: Line Items */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          {/* Header kolom */}
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
                const product = productId ? products.find(p => p.id === productId) ?? null : null
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
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Baris
          </button>
        </div>
      </div>

      {/* Row 5: Ongkir + Deskripsi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ongkir (Rp)
          </label>
          {/* AC-4.8: numeric >= 0, per transaksi */}
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

      {/* Row 6: Summary — AC-4.11 */}
      <TransactionSummaryFooter summary={form.summary} showLaba />

      {/* Actions */}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
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
