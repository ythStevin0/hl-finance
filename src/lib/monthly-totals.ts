// src/lib/monthly-totals.ts
// ============================================================
// Helper untuk hitung totals dari daftar transaksi per bulan
// Extracted dari UI layer — SRP: kalkulasi bukan urusan komponen
// ============================================================

import type { Transaction, TransactionItem } from './supabase/types'

export type TransactionWithItems = Transaction & {
  items: TransactionItem[]
}

export interface MonthlyTotals {
  piutang: number       // omzet + ongkir dari transaksi Piutang (bukan bonus)
  sudahDibayar: number  // omzet + ongkir dari transaksi Lunas (bukan bonus)
  omzetLM: number       // omzet LM dari transaksi Lunas
  omzetBR: number       // omzet BR dari transaksi Lunas
  omzetTotal: number    // omzetLM + omzetBR
  laba: number          // total laba dari transaksi Lunas
}

export function calcMonthlyTotals(
  transactions: TransactionWithItems[]
): MonthlyTotals {
  let piutang = 0
  let sudahDibayar = 0
  let omzetLM = 0
  let omzetBR = 0
  let laba = 0

  for (const t of transactions) {
    // Skip bonus transactions dari revenue calculation (AC-5.7, 5.8)
    if (t.is_bonus) continue

    if (t.status === 'piutang') {
      piutang += t.total_omzet + t.ongkir
    } else {
      // status === 'lunas' — cash basis (D3)
      sudahDibayar += t.total_omzet + t.ongkir
      laba += t.total_laba

      for (const item of t.items) {
        if (item.product_type === 'LM') omzetLM += item.line_omzet
        else omzetBR += item.line_omzet
      }
    }
  }

  return {
    piutang,
    sudahDibayar,
    omzetLM,
    omzetBR,
    omzetTotal: omzetLM + omzetBR,
    laba,
  }
}
