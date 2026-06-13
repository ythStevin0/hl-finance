// src/app/dashboard/customers/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select(`*, customer_discount_steps(*)`)
    .eq('id', params.id)
    .is('soft_deleted_at', null)
    .single()

  if (!customer) notFound()

  const stepsLM = customer.customer_discount_steps
    .filter((s: any) => s.type === 'LM')
    .sort((a: any, b: any) => a.step_order - b.step_order)
    .map((s: any) => ({ id: s.id, value: s.value, step_order: s.step_order }))

  const stepsBR = customer.customer_discount_steps
    .filter((s: any) => s.type === 'BR')
    .sort((a: any, b: any) => a.step_order - b.step_order)
    .map((s: any) => ({ id: s.id, value: s.value, step_order: s.step_order }))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Pelanggan</h1>
        <p className="text-gray-500 text-sm mt-1">{customer.nama}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CustomerForm
          mode="edit"
          initialData={{
            id: customer.id,
            nama: customer.nama,
            bonus_threshold: customer.bonus_threshold,
            steps_lm: stepsLM,
            steps_br: stepsBR,
          }}
        />
      </div>
    </div>
  )
}
