// src/app/dashboard/customers/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'

import Link from 'next/link'

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
        <div className="flex items-center gap-2 mb-1 text-sm font-medium">
          <Link href="/dashboard/customers" className="text-gray-400 hover:text-gray-600">
            Pelanggan
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Edit Pelanggan</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Pelanggan</h1>
        <p className="text-gray-500 text-sm mt-1">{customer.nama}</p>
      </div>
      <div className="dash-card p-6 md:p-8">
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
