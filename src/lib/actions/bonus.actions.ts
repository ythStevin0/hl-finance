'use server'

// src/lib/actions/bonus.actions.ts
// ============================================================
// Server Actions untuk Bonus Logic
// AC-5.1–5.8: Bonus accumulator, eligibility, grant
// SRP: semua bonus DB write di satu tempat
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { calcBonusAvailable } from '@/lib/calculations'
import type { BonusStatus, GrantBonusInput } from '@/lib/types/bonus'
import type { ActionResult } from './transaction.actions'

/**
 * Ambil bonus status satu customer
 * AC-5.2: hitung accumulator dari lunas bukan bonus
 * AC-5.3: bonuses stack — floor(acc/threshold) - granted
 */
export async function getCustomerBonusStatus(
  customerId: string
): Promise<BonusStatus | null> {
  const supabase = await createClient()

  const [{ data: customer }, { data: summary }] = await Promise.all([
    supabase
      .from('customers')
      .select('id, nama, bonus_threshold')
      .eq('id', customerId)
      .single(),
    supabase
      .from('customer_summary')
      .select('bonus_accumulator, bonuses_granted')
      .eq('customer_id', customerId)
      .single(),
  ])

  if (!customer || !summary) return null

  const accumulator    = summary.bonus_accumulator
  const granted        = summary.bonuses_granted
  const threshold      = customer.bonus_threshold
  const available      = calcBonusAvailable(accumulator, threshold, granted)
  const carryOver      = accumulator - (Math.floor(accumulator / threshold) * threshold)

  return {
    customerId:       customer.id,
    customerNama:     customer.nama,
    threshold,
    accumulator,
    bonusesGranted:   granted,
    bonusesAvailable: available,
    carryOver,
  }
}

/**
 * Ambil bonus status semua customer — untuk dashboard & list
 * AC-5.4: surface eligibility ketika ada bonus tersedia
 */
export async function getAllBonusStatuses(): Promise<BonusStatus[]> {
  const supabase = await createClient()

  const [{ data: customers }, { data: summaries }] = await Promise.all([
    supabase
      .from('customers')
      .select('id, nama, bonus_threshold')
      .is('soft_deleted_at', null),
    supabase
      .from('customer_summary')
      .select('customer_id, bonus_accumulator, bonuses_granted'),
  ])

  if (!customers || !summaries) return []

  const summaryMap = new Map(summaries.map(s => [s.customer_id, s]))

  return customers.map(customer => {
    const summary     = summaryMap.get(customer.id)
    const accumulator = summary?.bonus_accumulator ?? 0
    const granted     = summary?.bonuses_granted ?? 0
    const threshold   = customer.bonus_threshold
    const available   = calcBonusAvailable(accumulator, threshold, granted)
    const carryOver   = accumulator - (Math.floor(accumulator / threshold) * threshold)

    return {
      customerId:       customer.id,
      customerNama:     customer.nama,
      threshold,
      accumulator,
      bonusesGranted:   granted,
      bonusesAvailable: available,
      carryOver,
    }
  })
}

/**
 * Record bonus grant setelah bon bonus dibuat
 * AC-5.5: multiple bonus bisa dalam 1 bon
 * AC-5.6: setiap grant konsumsi 1 threshold, sisa carry over
 *
 * DIPANGGIL setelah createTransaction berhasil dengan is_bonus=true
 */
export async function recordBonusGrant(
  input: GrantBonusInput
): Promise<ActionResult> {
  const supabase = await createClient()

  // Validasi: pastikan customer punya cukup bonus
  const status = await getCustomerBonusStatus(input.customerId)
  if (!status) return { success: false, error: 'Customer tidak ditemukan.' }

  if (input.quantityGranted > status.bonusesAvailable) {
    return {
      success: false,
      error: `Hanya ${status.bonusesAvailable} bonus tersedia, tidak bisa grant ${input.quantityGranted}.`,
    }
  }

  const { error } = await supabase
    .from('bonus_grants')
    .insert({
      customer_id:      input.customerId,
      transaction_id:   input.transactionId,
      quantity_granted: input.quantityGranted,
    })

  if (error) return { success: false, error: error.message }

  return { success: true }
}
