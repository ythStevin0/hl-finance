// src/lib/types/report.ts
// ============================================================
// Domain types untuk Laporan — Fase 5
// AC-7.1–7.8
// ============================================================

export type ReportScope = 'overall' | 'customer' | 'product-type'
export type ProductTypeFilter = 'ALL' | 'LM' | 'BR'

// Filter yang dipakai di semua jenis laporan
export interface ReportFilter {
  scope: ReportScope
  customerId?: string       // kalau scope = 'customer'
  productType?: ProductTypeFilter // kalau scope = 'product-type'
  month?: number            // 1–12, undefined = semua bulan
  year: number
}

// Satu baris di tabel rekap
export interface ReportRow {
  label: string             // Nama customer / bulan / tipe
  omzetLM: number
  omzetBR: number
  omzetTotal: number        // omzetLM + omzetBR
  labaHL: number
  piutang: number           // outstanding (status=piutang)
  sudahDibayar: number      // lunas (omzet + ongkir)
}

// Hasil query laporan lengkap
export interface ReportData {
  filter: ReportFilter
  rows: ReportRow[]
  totals: ReportRow         // Σ semua rows
  bonusTransactions: BonusLogRow[] // AC-7.7: terpisah
}

// Baris di bonus log — AC-7.7
export interface BonusLogRow {
  tanggal: string
  nomorBon: string
  customerNama: string
  quantityGranted: number
}
