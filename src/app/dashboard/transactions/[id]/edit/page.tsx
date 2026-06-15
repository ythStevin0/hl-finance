// src/app/dashboard/transactions/[id]/edit/page.tsx
// Update fase 4: load bonus statuses

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTransactionById, getActiveCustomers, getActiveProducts } from '@/lib/queries'
import { getAllBonusStatuses } from '@/lib/actions/bonus.actions'
import TransactionForm from '@/components/transactions/TransactionForm'

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const [transaction, customers, products, bonusStatusList] = await Promise.all([
    getTransactionById(supabase, params.id),
    getActiveCustomers(supabase),
    getActiveProducts(supabase),
    getAllBonusStatuses(),
  ])

  if (!transaction) notFound()

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

  const bonusStatuses = Object.fromEntries(
    bonusStatusList.map(s => [s.customerId, s])
  )

  const lineItemsWithProducts = transaction.items.map(item => {
    const activeProduct = products.find(p => p.id === item.product_id)
    const product = activeProduct ?? {
      id:              item.product_id,
      nama:            item.product_nama,
      type:            item.product_type,
      harga_base:      item.harga_base_snapshot,
      harga_modal:     item.harga_modal_snapshot,
      soft_deleted_at: new Date().toISOString(),
      created_at:      '',
    }

    return {
      product,
      qty:                 item.qty,
      discountedUnitPrice: item.discounted_unit_price,
      lineOmzet:           item.line_omzet,
      lineLaba:            item.line_laba,
      isFree:              item.is_free,
    }
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Bon</h1>
        <p className="text-gray-500 text-sm mt-1">{transaction.nomor_bon}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <TransactionForm
          mode="edit"
          editId={transaction.id}
          customers={customers}
          products={products}
          allDiscountSteps={allDiscountSteps}
          bonusStatuses={bonusStatuses}
          initialData={{
            nomorBon:   transaction.nomor_bon,
            tanggal:    transaction.tanggal,
            customerId: transaction.customer_id,
            ongkir:     transaction.ongkir,
            deskripsi:  transaction.deskripsi,
            isBonus:    transaction.is_bonus,
            lineItems:  lineItemsWithProducts,
          }}
        />
      </div>
    </div>
  )
}
