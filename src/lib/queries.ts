// src/lib/queries.ts
// ============================================================
// Typed query helpers — DRY untuk query Supabase yang berulang
// Semua soft-delete filter ada di satu tempat (SRP)
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'
import type {
  Customer,
  CustomerWithDiscounts,
  DiscountStep,
  Product,
  Transaction,
  TransactionItem,
  CustomerSummary,
} from './supabase/types'

type DB = SupabaseClient<Database>

// ---- Customers ----

export async function getActiveCustomers(supabase: DB): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .is('soft_deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getCustomerById(
  supabase: DB,
  id: string
): Promise<Customer | null> {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .is('soft_deleted_at', null)
    .single()

  return data ?? null
}

export async function getCustomerWithDiscounts(
  supabase: DB,
  id: string
): Promise<CustomerWithDiscounts | null> {
  const { data } = await supabase
    .from('customers')
    .select('*, customer_discount_steps(*)')
    .eq('id', id)
    .is('soft_deleted_at', null)
    .single()

  if (!data) return null

  const steps = (data.customer_discount_steps ?? []) as DiscountStep[]

  return {
    ...data,
    discount_steps_lm: steps
      .filter(s => s.type === 'LM')
      .sort((a, b) => a.step_order - b.step_order),
    discount_steps_br: steps
      .filter(s => s.type === 'BR')
      .sort((a, b) => a.step_order - b.step_order),
  }
}

// ---- Products ----

export async function getActiveProducts(supabase: DB): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('soft_deleted_at', null)
    .order('type', { ascending: true })
    .order('nama', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getProductById(
  supabase: DB,
  id: string
): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .is('soft_deleted_at', null)
    .single()

  return data ?? null
}

// ---- Transactions ----

export type TransactionWithItems = Transaction & {
  items: TransactionItem[]
  customers?: { id: string; nama: string } | null
}

export async function getTransactionById(
  supabase: DB,
  id: string
): Promise<TransactionWithItems | null> {
  const { data } = await supabase
    .from('transactions')
    .select('*, transaction_items(*), customers(id, nama)')
    .eq('id', id)
    .single()

  if (!data) return null

  return {
    ...data,
    items: (data.transaction_items ?? []) as TransactionItem[],
    customers: data.customers as { id: string; nama: string } | null,
  }
}

export async function getTransactionsByCustomerAndMonth(
  supabase: DB,
  customerId: string,
  year: number,
  month: number
): Promise<TransactionWithItems[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .eq('customer_id', customerId)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)
    .order('tanggal', { ascending: false })

  if (error) throw error

  return (data ?? []).map(t => ({
    ...t,
    items: (t.transaction_items ?? []) as TransactionItem[],
  }))
}

// ---- Customer Summary (View) ----

export async function getCustomerSummaries(supabase: DB): Promise<CustomerSummary[]> {
  const { data, error } = await supabase
    .from('customer_summary')
    .select('*')

  if (error) throw error
  return data ?? []
}

export async function getCustomerSummaryById(
  supabase: DB,
  customerId: string
): Promise<CustomerSummary | null> {
  const { data } = await supabase
    .from('customer_summary')
    .select('*')
    .eq('customer_id', customerId)
    .single()

  return data ?? null
}
