// src/app/dashboard/bonus/[customerId]/page.tsx
// AC-5.8: Bonus transactions clearly distinguishable
// AC-7.7: Bonus log terpisah dari omzet/revenue

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCustomerById } from '@/lib/queries'
import { getCustomerBonusStatus } from '@/lib/actions/bonus.actions'
import { formatRupiah } from '@/lib/calculations'
import BonusStatusCard from '@/components/bonus/BonusStatusCard'

export default async function CustomerBonusLogPage({
  params,
}: {
  params: { customerId: string }
}) {
  const supabase = await createClient()

  const [customer, bonusStatus] = await Promise.all([
    getCustomerById(supabase, params.customerId),
    getCustomerBonusStatus(params.customerId),
  ])

  if (!customer || !bonusStatus) notFound()

  // Ambil semua bonus grants beserta transaksinya
  const { data: grants } = await supabase
    .from('bonus_grants')
    .select('*, transactions(nomor_bon, tanggal, id)')
    .eq('customer_id', params.customerId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-1 text-sm">
        <Link href="/dashboard/bonus" className="text-gray-400 hover:text-gray-600">
          Bonus
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">{customer.nama}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{customer.nama}</h1>

      {/* Status Card */}
      <div className="mb-6">
        <BonusStatusCard status={bonusStatus} showLink={false} />
      </div>

      {/* Bonus Grant History — AC-5.8, AC-7.7 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">
            Riwayat Bonus Diberikan
            <span className="ml-2 text-gray-400 font-normal">({grants?.length ?? 0})</span>
          </h2>
        </div>

        {grants && grants.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {grants.map(grant => (
              <div key={grant.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                      {grant.quantity_granted}× bonus
                    </span>
                    {/* @ts-expect-error supabase join */}
                    <Link
                      href={`/dashboard/transactions/${grant.transactions?.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {/* @ts-expect-error supabase join */}
                      {grant.transactions?.nomor_bon ?? '—'}
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {/* @ts-expect-error supabase join */}
                    {grant.transactions?.tanggal
                      ? new Date(grant.transactions.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-500">
                    − {formatRupiah(grant.quantity_granted * bonusStatus.threshold)}
                  </p>
                  <p className="text-xs text-gray-400">dikonsumsi</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            Belum ada bonus yang pernah diberikan.
          </div>
        )}
      </div>
    </div>
  )
}
