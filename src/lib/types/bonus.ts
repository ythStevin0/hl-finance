// src/lib/types/bonus.ts
// ============================================================
// Domain types untuk Bonus Logic — Fase 4
// AC-5.1 s/d AC-5.8
// ============================================================

// Status bonus satu customer — hasil kalkulasi dari accumulator
export interface BonusStatus {
  customerId: string
  customerNama: string
  threshold: number
  accumulator: number      // total omzet lunas (bukan bonus)
  bonusesGranted: number   // SUM(quantity_granted) — bukan COUNT rows
  bonusesAvailable: number // floor(accumulator/threshold) - granted
  carryOver: number        // sisa menuju bonus berikutnya
}

// Input saat user membuat bon bonus
export interface GrantBonusInput {
  customerId: string
  transactionId: string
  quantityGranted: number  // berapa bonus dikonsumsi di bon ini
}
