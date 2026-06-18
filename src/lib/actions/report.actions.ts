'use server'

// src/lib/actions/report.actions.ts
// ============================================================
// Server Actions untuk Laporan
// AC-7.1–7.8: recap per customer, per tipe, overall
// SRP: semua query laporan di satu file
// Cash basis: HANYA transaksi Lunas masuk omzet & laba (D3)
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { ReportFilter, ReportData, ReportRow, BonusLogRow } from '@/lib/types/report'

// ---- Helper: buat row kosong ----
function emptyRow(label: string): ReportRow {
  return { label, omzetLM: 0, omzetBR: 0, omzetTotal: 0, labaHL: 0, piutang: 0, sudahDibayar: 0 }
}

// ---- Helper: hitung total dari array rows ----
function sumRows(rows: ReportRow[]): ReportRow {
  return rows.reduce((acc, row) => ({
    label:        'Total',
    omzetLM:      acc.omzetLM      + row.omzetLM,
    omzetBR:      acc.omzetBR      + row.omzetBR,
    omzetTotal:   acc.omzetTotal   + row.omzetTotal,
    labaHL:       acc.labaHL       + row.labaHL,
    piutang:      acc.piutang      + row.piutang,
    sudahDibayar: acc.sudahDibayar + row.sudahDibayar,
  }), emptyRow('Total'))
}

// ---- Helper: build date range filter ----
function buildDateRange(year: number, month?: number) {
  if (month) {
    return {
      start: `${year}-${String(month).padStart(2, '0')}-01`,
      end:   new Date(year, month, 0).toISOString().split('T')[0],
    }
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` }
}

/**
 * Query utama laporan — semua scope pakai fungsi ini
 * AC-7.5: omzet, laba, piutang, sudah dibayar, LM vs BR
 * AC-7.7: bonus transactions excluded dari totals
 */
export async function getReportData(filter: ReportFilter): Promise<ReportData> {
  const supabase = await createClient()
  const { start, end } = buildDateRange(filter.year, filter.month)

  // Ambil semua transaksi dalam range + items
  let txQuery = supabase
    .from('transactions')
    .select('*, transaction_items(*), customers(id, nama)')
    .gte('tanggal', start)
    .lte('tanggal', end)

  // Filter per customer — AC-7.1
  if (filter.scope === 'customer' && filter.customerId) {
    txQuery = txQuery.eq('customer_id', filter.customerId)
  }

  const { data: transactions } = await txQuery

  if (!transactions) {
    return { filter, rows: [], totals: emptyRow('Total'), bonusTransactions: [] }
  }

  // Pisah bonus dari normal — AC-7.7
  const normalTx = transactions.filter(t => !t.is_bonus)
  const bonusTx  = transactions.filter(t => t.is_bonus)

  // ---- Build rows berdasarkan scope ----
  let rows: ReportRow[] = []

  if (filter.scope === 'overall' || filter.scope === 'customer') {
    // Group by bulan
    const monthMap = new Map<number, ReportRow>()

    for (const tx of normalTx) {
      const m = new Date(tx.tanggal).getMonth() + 1
      if (!monthMap.has(m)) {
        const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
        monthMap.set(m, emptyRow(MONTHS[m - 1]))
      }
      const row = monthMap.get(m)!

      const items = (tx.transaction_items ?? []) as any[]

      if (tx.status === 'lunas') {
        // Cash basis — D3
        for (const item of items) {
          // Filter tipe produk — AC-7.2
          if (filter.scope === 'customer' && filter.productType && filter.productType !== 'ALL') {
            if (item.product_type !== filter.productType) continue
          }
          if (item.product_type === 'LM') row.omzetLM += item.line_omzet
          else                             row.omzetBR += item.line_omzet
        }
        row.omzetTotal   = row.omzetLM + row.omzetBR
        row.labaHL      += tx.total_laba
        row.sudahDibayar += tx.total_omzet + tx.ongkir
      } else {
        row.piutang += tx.total_omzet + tx.ongkir
      }
    }

    // Urutkan bulan 1–12
    rows = Array.from(monthMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, row]) => row)

  } else if (filter.scope === 'product-type') {
    // Group by LM dan BR — AC-7.2
    const lmRow = emptyRow('LM')
    const brRow = emptyRow('BR')

    for (const tx of normalTx) {
      if (tx.status !== 'lunas') {
        lmRow.piutang += tx.total_omzet + tx.ongkir
        continue
      }
      const items = (tx.transaction_items ?? []) as any[]
      for (const item of items) {
        if (item.product_type === 'LM') {
          lmRow.omzetLM    += item.line_omzet
          lmRow.omzetTotal += item.line_omzet
          lmRow.labaHL     += item.line_laba
          lmRow.sudahDibayar += item.line_omzet
        } else {
          brRow.omzetBR    += item.line_omzet
          brRow.omzetTotal += item.line_omzet
          brRow.labaHL     += item.line_laba
          brRow.sudahDibayar += item.line_omzet
        }
      }
    }
    rows = [lmRow, brRow]
  }

  // Bonus log — AC-7.7
  const bonusTransactions: BonusLogRow[] = bonusTx.map(t => ({
    tanggal:       t.tanggal,
    nomorBon:      t.nomor_bon,
    customerNama:  (t.customers as any)?.nama ?? '—',
    quantityGranted: 0, // akan diisi dari bonus_grants
  }))

  // Ambil bonus grants untuk log — wrapped in try-catch in case table doesn't exist
  try {
    if (bonusTx.length > 0) {
      const { data: grants } = await supabase
        .from('bonus_grants')
        .select('transaction_id, quantity_granted')
        .in('transaction_id', bonusTx.map(t => t.id))

      const grantMap = new Map(grants?.map(g => [g.transaction_id, g.quantity_granted]) ?? [])
      bonusTransactions.forEach(b => {
        const tx = bonusTx.find(t => t.nomor_bon === b.nomorBon)
        if (tx) b.quantityGranted = grantMap.get(tx.id) ?? 0
      })
    }
  } catch {
    // bonus_grants table may not exist yet — continue without bonus data
    console.warn('bonus_grants query failed — table may not exist')
  }

  return {
    filter,
    rows,
    totals: sumRows(rows),
    bonusTransactions,
  }
}
