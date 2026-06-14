// src/lib/types/transaction.ts
// ============================================================
// Domain types untuk Transaction (Bon) — Fase 3
// Dipisah dari supabase/types.ts karena ini adalah
// form-state types, bukan database row types (SRP)
// ============================================================

import type { Product, Customer, DiscountStep } from '@/lib/supabase/types'

// Satu baris item di form transaksi
export interface LineItemDraft {
  // ID unik untuk kebutuhan React key — bukan DB id
  draftId: string
  product: Product | null
  qty: number
  // Dihitung otomatis saat product/customer berubah
  discountedUnitPrice: number
  lineOmzet: number
  lineLaba: number
  // Untuk bonus lines: harga = 0 (AC-5.7)
  isFree: boolean
}

// State keseluruhan form transaksi
export interface TransactionFormState {
  nomorBon: string
  tanggal: string
  customerId: string
  ongkir: number
  deskripsi: string
  isBonus: boolean
  lineItems: LineItemDraft[]
}

// Customer lengkap dengan discount map untuk lookup cepat
export interface CustomerWithDiscountMap {
  customer: Customer
  // Map: type → sorted discount values
  // Contoh: { LM: [20, 20, 10], BR: [15] }
  discountMap: Record<'LM' | 'BR', number[]>
}

// Computed summary dari line items — ditampilkan di footer form
export interface TransactionSummary {
  totalOmzet: number
  totalLaba: number
  ongkir: number
  totalTagihan: number // omzet + ongkir
}
