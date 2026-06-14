// src/app/dashboard/transactions/[id]/edit/page.tsx
// AC-4.10: user can edit a transaction
// AC-4.10.1: editing recalculates omzet, profit, totals

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTransactionById, getActiveCustomers, getActiveProducts } from '@/lib/queries'
import TransactionForm from '@/components/transactions/TransactionForm'

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const [transaction, customers, products] = await Promise.all([
    getTransactionById(supabase, params.id),
    getActiveCustomers(supabase),
    getActiveProducts(supabase),
  ])

  if (!transaction) notFound()

  // Load discount steps — 1 query untuk semua customers (DRY, efisien)
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

  // Rebuild products untuk setiap line item dari snapshot
  // Kita butuh Product object yang lengkap untuk form
  // Gunakan snapshot data dari transaction_items
  const lineItemsWithProducts = transaction.items.map(item => {
    // Cari produk aktif yang matching — kalau tidak ada (soft-deleted), buat dari snapshot
    const activeProduct = products.find(p => p.id === item.product_id)

    const product = activeProduct ?? {
      id: item.product_id,
      nama: item.product_nama,
      type: item.product_type,
      harga_base: item.harga_base_snapshot,
      harga_modal: item.harga_modal_snapshot,
      soft_deleted_at: new Date().toISOString(), // sudah dihapus
      created_at: '',
    }

    return {
      product,
      qty: item.qty,
      discountedUnitPrice: item.discounted_unit_price,
      lineOmzet: item.line_omzet,
      lineLaba: item.line_laba,
      isFree: item.is_free,
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
