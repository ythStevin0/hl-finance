// src/lib/calculations.ts
// ============================================================
// CORE BUSINESS LOGIC — Single Source of Truth
// Semua kalkulasi mengacu ke Section 8 "Master Calculation Reference"
// di Acceptance Criteria
// ============================================================

/**
 * Cascading discount — AC-2.5, AC-2.9
 * BUKAN sum, tapi sequential multiply
 *
 * Contoh: B=100, steps=[20, 20, 10]
 * → 100 × 0.8 × 0.8 × 0.9 = 57.6  ✅
 * → BUKAN 100 × (1 - 0.50) = 50    ❌
 */
export function cascadingDiscount(basePrice: number, steps: number[]): number {
  if (steps.length === 0) return basePrice
  return steps.reduce((price, step) => price * (1 - step / 100), basePrice)
}

/**
 * Hitung effective discount percentage (untuk display saja)
 * Contoh: [20, 20, 10] → 42.4% (bukan 50%)
 */
export function effectiveDiscountPercent(steps: number[]): number {
  const multiplier = steps.reduce((m, step) => m * (1 - step / 100), 1)
  return (1 - multiplier) * 100
}

/**
 * Line omzet = discounted_unit_price × qty
 * AC-4.11, Section 8
 */
export function calcLineOmzet(discountedUnitPrice: number, qty: number): number {
  return Math.round(discountedUnitPrice * qty)
}

/**
 * Line Laba HL = (discounted_unit_price - harga_modal) × qty
 * AC Section 8: "Ongkir is pass-through → it does not affect Laba HL"
 * D1: Laba = omzet - modal
 */
export function calcLineLaba(
  discountedUnitPrice: number,
  hargaModal: number,
  qty: number
): number {
  return Math.round((discountedUnitPrice - hargaModal) * qty)
}

/**
 * Transaction omzet = Σ line omzet (ongkir excluded)
 * AC Section 8, D2
 */
export function calcTransactionOmzet(
  lines: { discountedUnitPrice: number; qty: number }[]
): number {
  return lines.reduce((sum, line) => sum + calcLineOmzet(line.discountedUnitPrice, line.qty), 0)
}

/**
 * Amount owed (Piutang) = transaction omzet + ongkir
 * AC-4.11, D2: "Customer owes omzet + ongkir; omzet excludes ongkir"
 */
export function calcAmountOwed(transactionOmzet: number, ongkir: number): number {
  return transactionOmzet + ongkir
}

/**
 * Transaction Laba HL = Σ line Laba HL (ongkir excluded — pass-through)
 * D1: ongkir tidak masuk laba
 */
export function calcTransactionLaba(
  lines: { discountedUnitPrice: number; hargaModal: number; qty: number }[]
): number {
  return lines.reduce(
    (sum, line) => sum + calcLineLaba(line.discountedUnitPrice, line.hargaModal, line.qty),
    0
  )
}

/**
 * Bonus available = floor(accumulator / threshold) - bonuses_already_granted
 * AC-5.3: bonuses STACK
 *
 * CRITICAL: bonuses_already_granted harus SUM(quantity_granted),
 * bukan COUNT(rows) di bonus_grants — AC-5.5: multiple bonus dalam 1 bon
 */
export function calcBonusAvailable(
  accumulatedPaidOmzet: number,
  threshold: number,
  bonusesAlreadyGranted: number
): number {
  if (threshold <= 0) return 0
  const earned = Math.floor(accumulatedPaidOmzet / threshold)
  return Math.max(0, earned - bonusesAlreadyGranted)
}

/**
 * Bonus carry-over setelah grant
 * AC-5.6: remainder carries over
 */
export function calcBonusCarryOver(
  accumulatedPaidOmzet: number,
  threshold: number,
  bonusesGranted: number
): number {
  return accumulatedPaidOmzet - bonusesGranted * threshold
}

// ============================================================
// Formatting utilities (IDR currency)
// ============================================================

/**
 * Format angka ke format Rupiah
 * Contoh: 1400000 → "Rp 1.400.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format angka pendek untuk display: 1.400.000
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

/**
 * Parse input string rupiah ke number
 * "1.400.000" → 1400000
 */
export function parseRupiah(value: string): number {
  return parseInt(value.replace(/\./g, '').replace(/,/g, ''), 10) || 0
}
