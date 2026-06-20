// src/app/dashboard/customers/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRupiah, calcBonusAvailable } from '@/lib/calculations'
import DeleteCustomerButton from '@/components/customers/DeleteCustomerButton'
import { getActiveCustomersWithDiscounts, getCustomerSummaries } from '@/lib/queries'

export default async function CustomersPage() {
  const supabase = await createClient()

  // Ambil data pelanggan dan ringkasannya menggunakan query helper terpusat
  const [customers, summaries] = await Promise.all([
    getActiveCustomersWithDiscounts(supabase),
    getCustomerSummaries(supabase),
  ])

  const summaryMap = new Map(summaries.map(s => [s.customer_id, s]))


  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-500 text-sm mt-1">
            {customers?.length ?? 0} pelanggan aktif
          </p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="dash-vip-btn"
          style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Pelanggan
          </div>
        </Link>
      </div>

      {/* List */}
      {customers && customers.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {customers.map((customer) => {
              const summary = summaryMap.get(customer.id)
              const bonusAvailable = summary
                ? calcBonusAvailable(
                    summary.bonus_accumulator,
                    customer.bonus_threshold,
                    summary.bonuses_granted
                  )
                : 0

              const stepsLM = customer.customer_discount_steps
                ?.filter((s: any) => s.type === 'LM')
                .sort((a: any, b: any) => a.step_order - b.step_order)
                .map((s: any) => s.value) ?? []

              const stepsBR = customer.customer_discount_steps
                ?.filter((s: any) => s.type === 'BR')
                .sort((a: any, b: any) => a.step_order - b.step_order)
                .map((s: any) => s.value) ?? []

              return (
                <div key={customer.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1c1917, #0a0a0a)' }}>
                    <span className="text-[#fde68a] font-bold text-sm">
                      {customer.nama.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {customer.nama}
                      </Link>
                      {bonusAvailable > 0 && (
                        <span className="dash-table-bonus">
                          🎁 {bonusAvailable}× bonus
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">
                        LM: {stepsLM.length > 0 ? stepsLM.map((v: number) => `${v}%`).join(' + ') : '—'}
                      </span>
                      <span className="text-gray-200 text-xs">|</span>
                      <span className="text-xs text-gray-400">
                        BR: {stepsBR.length > 0 ? stepsBR.map((v: number) => `${v}%`).join(' + ') : '—'}
                      </span>
                      <span className="text-gray-200 text-xs">|</span>
                      <span className="text-xs text-gray-400">
                        Bonus tiap {formatRupiah(customer.bonus_threshold)}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  {summary && (
                    <div className="hidden md:flex items-center gap-6 text-right shrink-0">
                      <div>
                        <p className="text-xs text-gray-400">Piutang</p>
                        <p className="text-sm font-medium text-amber-600">
                          {formatRupiah(summary.total_piutang)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Omzet (Lunas)</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatRupiah(summary.total_omzet_lunas)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Detail"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/dashboard/customers/${customer.id}/edit`}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </Link>
                    <DeleteCustomerButton customerId={customer.id} customerName={customer.nama} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">Belum ada pelanggan</p>
          <p className="text-gray-400 text-sm mb-4">Tambah pelanggan pertama untuk mulai mencatat transaksi.</p>
          <Link href="/dashboard/customers/new" className="btn-primary inline-flex">
            Tambah Pelanggan
          </Link>
        </div>
      )}
    </div>
  )
}
