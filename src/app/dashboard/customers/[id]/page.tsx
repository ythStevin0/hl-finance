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
import Badge from '@/components/ui/Badge'
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">
            Transaksi {MONTH_NAMES_LONG[month - 1]} {year}
            <span className="ml-2 text-gray-400 font-normal">({transactions.length})</span>
          </h2>
          <Link
            href={`/dashboard/transactions/new?customer_id=${params.id}`}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Bon Baru
          </Link>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {transactions.map(t => (
              <div key={t.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/transactions/${t.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {t.nomor_bon}
                    </Link>
                    {t.is_bonus && <Badge variant="bonus">Bonus</Badge>}
                    <Badge variant={t.status === 'lunas' ? 'lunas' : 'piutang'}>
                      {t.status === 'lunas' ? 'Lunas' : 'Piutang'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(t.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {t.payment_date && (
                      <> · Bayar: {new Date(t.payment_date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short',
                      })}</>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {formatRupiah(t.total_omzet + t.ongkir)}
                  </p>
                  {t.ongkir > 0 && (
                    <p className="text-xs text-gray-400">ongkir {formatRupiah(t.ongkir)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            Tidak ada transaksi di bulan ini.
          </div>
        )}
      </div>
    </div>
  )
}
