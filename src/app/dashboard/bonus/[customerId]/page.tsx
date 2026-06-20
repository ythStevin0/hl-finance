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
    <div className="p-6 max-w-4xl mx-auto">
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
      <div className="mb-8">
        <BonusStatusCard status={bonusStatus} showLink={false} />
      </div>

      {/* Bonus Grant History — AC-5.8, AC-7.7 */}
      <div className="dash-card p-0">
        <div className="px-5 py-4 flex items-center justify-between mb-2">
          <h2 className="dash-card-title">
            Riwayat Bonus Diberikan
            <span className="ml-2 text-gray-400 font-normal">({grants?.length ?? 0})</span>
          </h2>
        </div>

        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Bonus Diklaim</th>
                <th>Nomor Bon</th>
                <th>Tanggal</th>
                <th style={{ textAlign: 'right' }}>Nilai Konsumsi</th>
              </tr>
            </thead>
            <tbody>
              {grants && grants.length > 0 ? (
                grants.map(grant => (
                  <tr key={grant.id}>
                    <td>
                      <span className="dash-table-bonus">
                        {grant.quantity_granted}× bonus
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/transactions/${grant.transactions?.id}`}
                        className="text-sm font-medium text-[#0f172a] hover:text-[#d97706]"
                      >
                        {grant.transactions?.nomor_bon ?? '—'}
                      </Link>
                    </td>
                    <td className="text-gray">
                      {grant.transactions?.tanggal
                        ? new Date(grant.transactions.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <p className="text-sm font-medium text-rose-500">
                        − {formatRupiah(grant.quantity_granted * bonusStatus.threshold)}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }} className="text-gray">
                    Belum ada bonus yang pernah diberikan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
