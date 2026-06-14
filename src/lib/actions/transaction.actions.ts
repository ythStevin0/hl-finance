'use server'

// src/lib/actions/transaction.actions.ts
// ============================================================
// Server Actions untuk Transaction (Bon)
// SRP: semua DB write logic di sini, bukan di komponen
// Ini juga memudahkan testing dan reuse
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { LineItemDraft } from '@/lib/types/transaction'
import type { TransactionItemInsert } from '@/lib/supabase/types'

// ---- Types ----

export interface CreateTransactionInput {
  nomorBon: string
  tanggal: string
  customerId: string
  ongkir: number
  deskripsi: string
  isBonus: boolean
  lineItems: LineItemDraft[]
  totalOmzet: number
  totalLaba: number
}

export interface ActionResult {
  success: boolean
  error?: string
  id?: string
}

// ---- Actions ----

/**
 * Buat transaksi baru beserta semua line items
 * AC-4.2: nomor bon unique — Supabase akan throw error kalau duplikat
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<ActionResult> {
  const supabase = await createClient()

  // Insert header transaksi
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      nomor_bon:   input.nomorBon.trim(),
      tanggal:     input.tanggal,
      customer_id: input.customerId,
      ongkir:      input.ongkir,
      deskripsi:   input.deskripsi,
      is_bonus:    input.isBonus,
      status:      'piutang', // AC-4.9: default piutang
      total_omzet: input.totalOmzet,
      total_laba:  input.totalLaba,
    })
    .select('id')
    .single()

  if (txError) {
    // AC-4.2: nomor bon duplicate
    if (txError.code === '23505') {
      return { success: false, error: `Nomor bon "${input.nomorBon}" sudah digunakan.` }
    }
    return { success: false, error: txError.message }
  }

  // Insert line items dengan snapshot harga (CRITICAL: harga tersimpan permanen)
  const items: TransactionItemInsert[] = input.lineItems
    .filter(item => item.product !== null)
    .map(item => ({
      transaction_id:        transaction.id,
      product_id:            item.product!.id,
      product_nama:          item.product!.nama,        // snapshot nama
      product_type:          item.product!.type,
      harga_base_snapshot:   item.product!.harga_base,  // snapshot base price
      harga_modal_snapshot:  item.product!.harga_modal, // snapshot modal
      discounted_unit_price: item.discountedUnitPrice,
      qty:                   item.qty,
      line_omzet:            item.lineOmzet,
      line_laba:             item.lineLaba,
      is_free:               item.isFree,
    }))

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(items)

  if (itemsError) {
    // Rollback: hapus transaksi header kalau items gagal
    await supabase.from('transactions').delete().eq('id', transaction.id)
    return { success: false, error: itemsError.message }
  }

  return { success: true, id: transaction.id }
}

/**
 * Update transaksi yang sudah ada
 * AC-4.10.1: recalculate omzet, profit, totals
 */
export async function updateTransaction(
  id: string,
  input: CreateTransactionInput
): Promise<ActionResult> {
  const supabase = await createClient()

  // Update header
  const { error: txError } = await supabase
    .from('transactions')
    .update({
      nomor_bon:   input.nomorBon.trim(),
      tanggal:     input.tanggal,
      customer_id: input.customerId,
      ongkir:      input.ongkir,
      deskripsi:   input.deskripsi,
      is_bonus:    input.isBonus,
      total_omzet: input.totalOmzet,
      total_laba:  input.totalLaba,
    })
    .eq('id', id)

  if (txError) {
    if (txError.code === '23505') {
      return { success: false, error: `Nomor bon "${input.nomorBon}" sudah digunakan.` }
    }
    return { success: false, error: txError.message }
  }

  // Hapus semua items lama, insert baru (simpler dan lebih aman dari partial update)
  await supabase.from('transaction_items').delete().eq('transaction_id', id)

  const items: TransactionItemInsert[] = input.lineItems
    .filter(item => item.product !== null)
    .map(item => ({
      transaction_id:        id,
      product_id:            item.product!.id,
      product_nama:          item.product!.nama,
      product_type:          item.product!.type,
      harga_base_snapshot:   item.product!.harga_base,
      harga_modal_snapshot:  item.product!.harga_modal,
      discounted_unit_price: item.discountedUnitPrice,
      qty:                   item.qty,
      line_omzet:            item.lineOmzet,
      line_laba:             item.lineLaba,
      is_free:               item.isFree,
    }))

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(items)

  if (itemsError) return { success: false, error: itemsError.message }

  return { success: true, id }
}

/**
 * Settle satu bon dengan tanggal pelunasan
 * AC-6.6: settle single bon
 * AC-6.8: hanya bon yang masih piutang bisa di-settle
 */
export async function settleSingleTransaction(
  id: string,
  paymentDate: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions')
    .update({ status: 'lunas', payment_date: paymentDate })
    .eq('id', id)
    .eq('status', 'piutang') // AC-6.8: guard — hanya piutang yang bisa diubah

  if (error) return { success: false, error: error.message }

  return { success: true }
}

/**
 * Hapus transaksi (hard delete — tidak ada soft delete untuk transaksi di spec)
 * AC-4.10: user can delete a transaction
 */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  return { success: true }
}
