// src/app/dashboard/transactions/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getActiveCustomers, getActiveProducts } from '@/lib/queries'
import TransactionForm from '@/components/transactions/TransactionForm'

interface PageProps {
  searchParams: { customer_id?: string; bonus?: string }
}

export default async function NewTransactionPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Load semua data yang dibutuhkan form di server — tidak ada loading state
  const [customers, products] = await Promise.all([
    getActiveCustomers(supabase),
    getActiveProducts(supabase),
  ])

  // Load semua discount steps sekaligus — 1 query, bukan N queries
  const { data: allSteps } = await supabase
    .from('customer_discount_steps')
    .select('*')
    .order('step_order', { ascending: true })

  // Group steps per customer per type
  const allDiscountSteps: Record<string, { LM: any[]; BR: any[] }> = {}
  for (const step of allSteps ?? []) {
    if (!allDiscountSteps[step.customer_id]) {
      allDiscountSteps[step.customer_id] = { LM: [], BR: [] }
    }
    allDiscountSteps[step.customer_id][step.type as 'LM' | 'BR'].push(step)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buat Bon Baru</h1>
        <p className="text-gray-500 text-sm mt-1">
          Status default: Piutang. Bisa diubah jadi Lunas setelah bon dibuat.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <TransactionForm
          mode="new"
          customers={customers}
          products={products}
          allDiscountSteps={allDiscountSteps}
          defaultCustomerId={searchParams.customer_id}
          defaultIsBonus={searchParams.bonus === 'true'}
        />
      </div>
    </div>
  )
}
