// src/app/dashboard/transactions/new/page.tsx
// Update fase 4: load bonus statuses untuk BonusGrantSelector

import { createClient } from '@/lib/supabase/server'
import { getActiveCustomers, getActiveProducts } from '@/lib/queries'
import { getAllBonusStatuses } from '@/lib/actions/bonus.actions'
import TransactionForm from '@/components/transactions/TransactionForm'

interface PageProps {
  searchParams: { customer_id?: string; bonus?: string }
}

export default async function NewTransactionPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const [customers, products, bonusStatusList] = await Promise.all([
    getActiveCustomers(supabase),
    getActiveProducts(supabase),
    getAllBonusStatuses(),
  ])

  // 1 query untuk semua discount steps
  const { data: allSteps } = await supabase
    .from('customer_discount_steps')
    .select('*')
    .order('step_order', { ascending: true })

  const allDiscountSteps: Record<string, { LM: any[]; BR: any[] }> = {}
  for (const step of allSteps ?? []) {
    if (!allDiscountSteps[step.customer_id]) {
      allDiscountSteps[step.customer_id] = { LM: [], BR: [] }
    }
    allDiscountSteps[step.customer_id][step.type as 'LM' | 'BR'].push(step)
  }

  // Convert bonus status list ke map untuk lookup O(1)
  const bonusStatuses = Object.fromEntries(
    bonusStatusList.map(s => [s.customerId, s])
  )

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
          bonusStatuses={bonusStatuses}
          defaultCustomerId={searchParams.customer_id}
          defaultIsBonus={searchParams.bonus === 'true'}
        />
      </div>
    </div>
  )
}
