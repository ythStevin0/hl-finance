// src/app/dashboard/customers/[id]/page.tsx
// AC-6.1–6.9: Customer detail dengan transaksi per bulan
// Refactored: kalkulasi di monthly-totals.ts (SRP), pakai StatCard (DRY),
// query di queries.ts (DRY), tidak ada any types

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, calcBonusAvailable } from '@/lib/calculations'
import { calcMonthlyTotals } from '@/lib/monthly-totals'
import {
  getCustomerById,
  getCustomerSummaryById,
  getTransactionsByCustomerAndMonth,
} from '@/lib/queries'
import { MONTH_NAMES_SHORT, MONTH_NAMES_LONG } from '@/lib/constants'
import StatCard from '@/components/ui/StatCard'
import SettleMonthButton from '@/components/customers/SettleMonthButton'
import MonthSelector from '@/components/customers/MonthSelector'

interface PageProps {
  params: { id: string }
  searchParams: { month?: string; year?: string }
}

export default async function CustomerDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()

  const [customer, summary] = await Promise.all([
    getCustomerById(supabase, params.id),
    getCustomerSummaryById(supabase, params.id),
  ])

  if (!customer) notFound()

  const now = new Date()
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()))

  const transactions = await getTransactionsByCustomerAndMonth(supabase, params.id, year, month)

  // Semua kalkulasi di satu tempat — tidak ada logic di JSX
  const totals = calcMonthlyTotals(transactions)

  const bonusAvailable = summary
    ? calcBonusAvailable(summary.bonus_accumulator, customer.bonus_threshold, summary.bonuses_granted)
    : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb + Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm">
            <Link href="/dashboard/customers" className="text-gray-400 hover:text-gray-600">
              Pelanggan
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600">{customer.nama}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{customer.nama}</h1>
            {bonusAvailable > 0 && (
              <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium">
                🎁 {bonusAvailable}× bonus tersedia
              </span>
            )}
          </div>
        </div>
        <Link href={`/dashboard/customers/${customer.id}/edit`} className="btn-secondary">
          Edit
        </Link>
      </div>

      {/* Month Selector */}
      <MonthSelector customerId={params.id} currentMonth={month} currentYear={year} />

      {/* Stats — AC-6.2, AC-6.3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={`Piutang ${MONTH_NAMES_SHORT[month - 1]}`}
          value={formatRupiah(totals.piutang)}
          color="amber"
        />
        <StatCard
          label="Sudah Dibayar"
          value={formatRupiah(totals.sudahDibayar)}
          color="green"
        />
        {/* AC-6.3: LM dan BR terpisah */}
        <StatCard
          label="Omzet LM"
          value={formatRupiah(totals.omzetLM)}
          description={`BR: ${formatRupiah(totals.omzetBR)}`}
          color="blue"
        />
        <StatCard
          label="Laba HL"
          value={formatRupiah(totals.laba)}
          color="gray"
        />
      </div>

      {/* Settle Month — AC-6.5 */}
      {totals.piutang > 0 && (
        <div className="mb-4">
          <SettleMonthButton
            customerId={params.id}
            month={month}
            year={year}
            totalPiutang={totals.piutang}
          />
        </div>
      )}

      {/* Transaction List — AC-6.1 */}
      <div className="dash-card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="dash-card-title">
            Transaksi {MONTH_NAMES_LONG[month - 1]} {year}
            <span className="ml-2 text-gray-400 font-normal">({transactions.length})</span>
          </h2>
          <Link
            href={`/dashboard/transactions/new?customer_id=${params.id}`}
            className="text-xs font-bold text-[#f59e0b] hover:text-[#d97706]"
          >
            + Bon Baru
          </Link>
        </div>

        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Omzet</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <Link
                        href={`/dashboard/transactions/${t.id}`}
                        className="text-sm font-medium text-[#0f172a] hover:text-[#f59e0b]"
                      >
                        {t.nomor_bon}
                      </Link>
                      {t.is_bonus && <span className="dash-table-bonus">Bonus</span>}
                    </td>
                    <td className="text-gray">
                      {new Date(t.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                        {t.items?.[0]?.product_type ?? 'Mix'}
                      </span>
                    </td>
                    <td>
                      {formatRupiah(t.total_omzet + t.ongkir)}
                    </td>
                    <td>
                      <span className={`dash-status-badge ${
                        t.status === 'lunas' ? 'dash-status-paid' : 'dash-status-due'
                      }`}>
                        {t.status === 'lunas' ? 'PAID' : 'DUE'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }} className="text-gray">
                    Belum ada transaksi di bulan ini
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
