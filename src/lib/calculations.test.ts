// src/lib/calculations.test.ts
// ============================================================
// Unit tests untuk semua business logic calculations
// Run: npx jest src/lib/calculations.test.ts
// (atau: npx vitest run src/lib/calculations.test.ts)
// ============================================================

import { describe, test, expect } from 'vitest'
import {
  cascadingDiscount,
  effectiveDiscountPercent,
  calcLineOmzet,
  calcLineLaba,
  calcTransactionOmzet,
  calcAmountOwed,
  calcBonusAvailable,
  calcBonusCarryOver,
} from './calculations'

describe('cascadingDiscount', () => {
  // Test case dari AC-2.9 — ini yang WAJIB benar
  test('AC-2.9 example: B=100, [20,20,10] → 57.6', () => {
    expect(cascadingDiscount(100, [20, 20, 10])).toBeCloseTo(57.6, 1)
  })

  test('bukan sum: [20,20,10] ≠ 50%', () => {
    const result = cascadingDiscount(100, [20, 20, 10])
    expect(result).not.toBe(50)
  })

  test('no discount steps → return base price', () => {
    expect(cascadingDiscount(100000, [])).toBe(100000)
  })

  test('single step 30%', () => {
    expect(cascadingDiscount(100000, [30])).toBe(70000)
  })

  test('realistic price: base 50000, [20, 10]', () => {
    // 50000 × 0.8 × 0.9 = 36000
    expect(cascadingDiscount(50000, [20, 10])).toBeCloseTo(36000, 0)
  })

  test('100% discount → 0', () => {
    expect(cascadingDiscount(100000, [100])).toBe(0)
  })
})

describe('effectiveDiscountPercent', () => {
  test('AC-2.9: [20,20,10] → 42.4% (bukan 50%)', () => {
    expect(effectiveDiscountPercent([20, 20, 10])).toBeCloseTo(42.4, 1)
  })

  test('no steps → 0%', () => {
    expect(effectiveDiscountPercent([])).toBe(0)
  })
})

describe('calcLineOmzet', () => {
  test('discounted 57600 × qty 2 = 115200', () => {
    expect(calcLineOmzet(57600, 2)).toBe(115200)
  })

  test('qty 1 → same as unit price', () => {
    expect(calcLineOmzet(100000, 1)).toBe(100000)
  })
})

describe('calcLineLaba', () => {
  test('laba = (discounted - modal) × qty', () => {
    // discounted=57600, modal=40000, qty=2 → (17600)×2 = 35200
    expect(calcLineLaba(57600, 40000, 2)).toBe(35200)
  })

  test('laba bisa negatif jika jual di bawah modal', () => {
    expect(calcLineLaba(30000, 40000, 1)).toBe(-10000)
  })

  test('D1: ongkir tidak masuk laba (test isolasi)', () => {
    // Ongkir tidak ada di parameter calcLineLaba — by design
    const laba = calcLineLaba(57600, 40000, 1)
    expect(laba).toBe(17600) // bukan 17600 + ongkir
  })
})

describe('calcTransactionOmzet', () => {
  test('sum of line omzet, ongkir excluded', () => {
    const lines = [
      { discountedUnitPrice: 57600, qty: 2 },  // 115200
      { discountedUnitPrice: 80000, qty: 1 },  // 80000
    ]
    expect(calcTransactionOmzet(lines)).toBe(195200)
  })

  test('D2: ongkir tidak masuk omzet (ongkir tidak ada di parameter)', () => {
    const lines = [{ discountedUnitPrice: 100000, qty: 1 }]
    expect(calcTransactionOmzet(lines)).toBe(100000)
  })
})

describe('calcAmountOwed', () => {
  test('amount owed = omzet + ongkir', () => {
    expect(calcAmountOwed(195200, 50000)).toBe(245200)
  })

  test('ongkir 0 → amount = omzet', () => {
    expect(calcAmountOwed(100000, 0)).toBe(100000)
  })
})

describe('calcBonusAvailable — AC-5 scenarios', () => {
  // Skenario dari AC-5 worked example
  test('AC-5 example: 25jt paid, threshold 10jt, 0 granted → 2 available', () => {
    expect(calcBonusAvailable(25_000_000, 10_000_000, 0)).toBe(2)
  })

  test('after granting 2: 0 available', () => {
    expect(calcBonusAvailable(25_000_000, 10_000_000, 2)).toBe(0)
  })

  test('exactly at threshold: 10jt / 10jt = 1 bonus', () => {
    expect(calcBonusAvailable(10_000_000, 10_000_000, 0)).toBe(1)
  })

  test('just below threshold: 9.999.999 → 0 bonus', () => {
    expect(calcBonusAvailable(9_999_999, 10_000_000, 0)).toBe(0)
  })

  test('CRITICAL: bonusesGranted is SUM(quantity_granted) bukan COUNT', () => {
    // Customer punya 25jt, sudah dapat 2 bonus dalam 1 bon (quantity_granted=2)
    // granted = 2 (sum), bukan 1 (count rows)
    expect(calcBonusAvailable(25_000_000, 10_000_000, 2)).toBe(0)
  })

  test('accumulator 35jt, threshold 10jt, 2 granted → 1 available', () => {
    // floor(35/10)=3, 3-2=1
    expect(calcBonusAvailable(35_000_000, 10_000_000, 2)).toBe(1)
  })
})

describe('calcBonusCarryOver', () => {
  test('AC-5 example: 25jt, threshold 10jt, 2 granted → 5jt carry over', () => {
    expect(calcBonusCarryOver(25_000_000, 10_000_000, 2)).toBe(5_000_000)
  })

  test('exactly at 2x threshold: 0 carry over', () => {
    expect(calcBonusCarryOver(20_000_000, 10_000_000, 2)).toBe(0)
  })
})
