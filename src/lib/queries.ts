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

export type CustomerWithDiscountSteps = Customer & {
  customer_discount_steps?: DiscountStep[]
}

export async function getActiveCustomersWithDiscounts(supabase: DB): Promise<CustomerWithDiscountSteps[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        customer_discount_steps (*)
      `)
      .is('soft_deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching active customers with discounts:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.warn('Unhandled exception in getActiveCustomersWithDiscounts:', err)
    return []
  }
}

export async function getActiveCustomers(supabase: DB): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .is('soft_deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching active customers:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.warn('Unhandled exception in getActiveCustomers:', err)
    return []
  }
}

export async function getCustomerById(
  supabase: DB,
  id: string
): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .is('soft_deleted_at', null)
      .single()

    if (error) {
      console.warn(`Error fetching customer ${id}:`, error.message)
      return null
    }
    return data ?? null
  } catch (err) {
    console.warn(`Unhandled exception in getCustomerById for ${id}:`, err)
    return null
  }
}

export async function getCustomerWithDiscounts(
  supabase: DB,
  id: string
): Promise<CustomerWithDiscounts | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*, customer_discount_steps(*)')
      .eq('id', id)
      .is('soft_deleted_at', null)
      .single()

    if (error || !data) {
      if (error) console.warn(`Error fetching customer discounts ${id}:`, error.message)
      return null
    }

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
  } catch (err) {
    console.warn(`Unhandled exception in getCustomerWithDiscounts for ${id}:`, err)
    return null
  }
}

// ---- Products ----

export async function getActiveProducts(supabase: DB): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('soft_deleted_at', null)
      .order('type', { ascending: true })
      .order('nama', { ascending: true })

    if (error) {
      console.warn('Error fetching active products:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.warn('Unhandled exception in getActiveProducts:', err)
    return []
  }
}

export async function getProductById(
  supabase: DB,
  id: string
): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .is('soft_deleted_at', null)
      .single()

    if (error) {
      console.warn(`Error fetching product ${id}:`, error.message)
      return null
    }
    return data ?? null
  } catch (err) {
    console.warn(`Unhandled exception in getProductById for ${id}:`, err)
    return null
  }
}

export type TransactionWithCustomerName = Transaction & {
  customers: { nama: string } | null
}

export async function getRecentTransactions(supabase: DB, limit: number = 100): Promise<TransactionWithCustomerName[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, customers(nama)')
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Error fetching recent transactions:', error.message)
      return []
    }
    return (data ?? []) as TransactionWithCustomerName[]
  } catch (err) {
    console.warn('Unhandled exception in getRecentTransactions:', err)
    return []
  }
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
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*), customers(id, nama)')
      .eq('id', id)
      .single()

    if (error || !data) {
      if (error) console.warn(`Error fetching transaction ${id}:`, error.message)
      return null
    }

    return {
      ...data,
      items: (data.transaction_items ?? []) as TransactionItem[],
      customers: data.customers as { id: string; nama: string } | null,
    }
  } catch (err) {
    console.warn(`Unhandled exception in getTransactionById for ${id}:`, err)
    return null
  }
}

export async function getTransactionsByCustomerAndMonth(
  supabase: DB,
  customerId: string,
  year: number,
  month: number
): Promise<TransactionWithItems[]> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .eq('customer_id', customerId)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .order('tanggal', { ascending: false })

    if (error) {
      console.warn(`Error fetching transactions for customer ${customerId}:`, error.message)
      return []
    }

    return (data ?? []).map(t => ({
      ...t,
      items: (t.transaction_items ?? []) as TransactionItem[],
    }))
  } catch (err) {
    console.warn(`Unhandled exception in getTransactionsByCustomerAndMonth for customer ${customerId}:`, err)
    return []
  }
}

// ---- Customer Summary (View) ----

export async function getCustomerSummaries(supabase: DB): Promise<CustomerSummary[]> {
  try {
    const { data, error } = await supabase
      .from('customer_summary')
      .select('*')

    if (error) {
      console.warn('Error fetching customer summaries:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.warn('Unhandled exception in getCustomerSummaries:', err)
    return []
  }
}

export async function getCustomerSummaryById(
  supabase: DB,
  customerId: string
): Promise<CustomerSummary | null> {
  try {
    const { data, error } = await supabase
      .from('customer_summary')
      .select('*')
      .eq('customer_id', customerId)
      .single()

    if (error) {
      console.warn(`Error fetching customer summary for customer ${customerId}:`, error.message)
      return null
    }
    return data ?? null
  } catch (err) {
    console.warn(`Unhandled exception in getCustomerSummaryById for customer ${customerId}:`, err)
    return null
  }
}

