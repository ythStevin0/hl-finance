'use client'

// src/hooks/useTransactionForm.ts
// ============================================================
// Custom hook untuk semua state & logic form transaksi
// SRP: komponen UI tidak perlu tahu cara hitung diskon atau manage items
// KISS: tiap fungsi satu tanggung jawab
// ============================================================

import { useState, useCallback, useMemo } from 'react'
import {
  cascadingDiscount,
  calcLineOmzet,
  calcLineLaba,
  calcTransactionOmzet,
  calcTransactionLaba,
  calcAmountOwed,
} from '@/lib/calculations'
import type {
  LineItemDraft,
  TransactionFormState,
  CustomerWithDiscountMap,
  TransactionSummary,
} from '@/lib/types/transaction'
import type { Product } from '@/lib/supabase/types'

// Buat draft ID unik untuk React key
function makeDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// Buat line item kosong baru
function makeEmptyLineItem(): LineItemDraft {
  return {
    draftId: makeDraftId(),
    product: null,
    qty: 1,
    discountedUnitPrice: 0,
    lineOmzet: 0,
    lineLaba: 0,
    isFree: false,
  }
}

// Hitung ulang satu line item berdasarkan product + customer discount
function recalcLineItem(
  item: LineItemDraft,
  customerDiscountMap: Record<'LM' | 'BR', number[]>,
  isFree: boolean
): LineItemDraft {
  if (!item.product) return item

  const steps = customerDiscountMap[item.product.type] ?? []
  const discountedUnitPrice = isFree
    ? 0
    : cascadingDiscount(item.product.harga_base, steps)

  const lineOmzet = isFree ? 0 : calcLineOmzet(discountedUnitPrice, item.qty)
  const lineLaba  = isFree ? 0 : calcLineLaba(discountedUnitPrice, item.product.harga_modal, item.qty)

  return { ...item, discountedUnitPrice, lineOmzet, lineLaba, isFree }
}

// ---- Hook ----

interface UseTransactionFormProps {
  initialState?: Partial<TransactionFormState>
  customerWithDiscounts: CustomerWithDiscountMap | null
  isBonus: boolean
}

export function useTransactionForm({
  initialState,
  customerWithDiscounts,
  isBonus,
}: UseTransactionFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [nomorBon, setNomorBon]     = useState(initialState?.nomorBon ?? '')
  const [tanggal, setTanggal]       = useState(initialState?.tanggal ?? today)
  const [customerId, setCustomerId] = useState(initialState?.customerId ?? '')
  const [ongkir, setOngkir]         = useState(initialState?.ongkir ?? 0)
  const [deskripsi, setDeskripsi]   = useState(initialState?.deskripsi ?? '')
  const [lineItems, setLineItems]   = useState<LineItemDraft[]>(
    initialState?.lineItems ?? [makeEmptyLineItem()]
  )

  const discountMap = customerWithDiscounts?.discountMap ?? { LM: [], BR: [] }

  // ---- Line item operations ----

  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, makeEmptyLineItem()])
  }, [])

  const removeLineItem = useCallback((draftId: string) => {
    setLineItems(prev => {
      if (prev.length === 1) return prev // AC-4.5: minimal 1 item
      return prev.filter(item => item.draftId !== draftId)
    })
  }, [])

  // Saat produk dipilih: snapshot harga, hitung diskon (AC-4.6, 4.7)
  const updateProduct = useCallback((draftId: string, product: Product | null) => {
    setLineItems(prev => prev.map(item => {
      if (item.draftId !== draftId) return item
      const updated = { ...item, product }
      return recalcLineItem(updated, discountMap, isBonus)
    }))
  }, [discountMap, isBonus])

  // Saat qty berubah: recalc omzet & laba
  const updateQty = useCallback((draftId: string, qty: number) => {
    setLineItems(prev => prev.map(item => {
      if (item.draftId !== draftId) return item
      const updated = { ...item, qty: Math.max(1, qty) } // AC-4.5: qty >= 1
      return recalcLineItem(updated, discountMap, isBonus)
    }))
  }, [discountMap, isBonus])

  // Saat customer berubah: recalc semua lines karena diskon beda
  const handleCustomerChange = useCallback((newCustomerId: string, newDiscountMap: Record<'LM' | 'BR', number[]>) => {
    setCustomerId(newCustomerId)
    setLineItems(prev => prev.map(item =>
      recalcLineItem(item, newDiscountMap, isBonus)
    ))
  }, [isBonus])

  // ---- Computed summary (memoized — tidak hitung ulang kalau tidak perlu) ----

  const summary: TransactionSummary = useMemo(() => {
    const totalOmzet = calcTransactionOmzet(
      lineItems.map(i => ({ discountedUnitPrice: i.discountedUnitPrice, qty: i.qty }))
    )
    const totalLaba = calcTransactionLaba(
      lineItems.map(i => ({
        discountedUnitPrice: i.discountedUnitPrice,
        hargaModal: i.product?.harga_modal ?? 0,
        qty: i.qty,
      }))
    )
    return {
      totalOmzet,
      totalLaba,
      ongkir,
      totalTagihan: calcAmountOwed(totalOmzet, ongkir),
    }
  }, [lineItems, ongkir])

  // ---- Validation ----

  function validate(): string | null {
    if (!nomorBon.trim()) return 'Nomor bon wajib diisi.'
    if (!customerId) return 'Pelanggan wajib dipilih.'
    if (lineItems.some(i => !i.product)) return 'Semua baris harus memiliki produk.'
    if (lineItems.some(i => i.qty < 1)) return 'Qty minimal 1 di setiap baris.'
    if (ongkir < 0) return 'Ongkir tidak boleh negatif.'
    return null
  }

  return {
    // State
    nomorBon, setNomorBon,
    tanggal, setTanggal,
    customerId,
    ongkir, setOngkir,
    deskripsi, setDeskripsi,
    lineItems,
    summary,
    // Actions
    addLineItem,
    removeLineItem,
    updateProduct,
    updateQty,
    handleCustomerChange,
    validate,
  }
}
