// src/app/dashboard/transactions/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRupiah } from '@/lib/calculations'
import EmptyState from '@/components/ui/EmptyState'
import { getRecentTransactions } from '@/lib/queries'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const transactions = await getRecentTransactions(supabase, 100)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi (Bon)</h1>
          <p className="text-gray-500 text-sm mt-1">{transactions?.length ?? 0} bon terakhir</p>
        </div>
        <Link 
          href="/dashboard/transactions/new" 
          className="dash-vip-btn"
          style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Buat Bon Baru
          </div>
        </Link>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="dash-card p-0 overflow-hidden">
          <div className="dash-table-container">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Nomor Bon</th>
                  <th>Pelanggan</th>
                  <th>Tanggal</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <Link
                        href={`/dashboard/transactions/${t.id}`}
                        className="text-sm font-medium text-[#0f172a] hover:text-[#f59e0b] mr-2"
                      >
                        {t.nomor_bon}
                      </Link>
                      {t.is_bonus && <span className="dash-table-bonus">Bonus</span>}
                    </td>
                    <td>
                      <span className="text-sm text-gray-700">{t.customers?.nama ?? '—'}</span>
                    </td>
                    <td className="text-gray">
                      {new Date(t.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="text-sm font-medium text-gray-900">
                        {formatRupiah(t.total_omzet + t.ongkir)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`dash-status-badge ${
                        t.status === 'lunas' ? 'dash-status-paid' : 'dash-status-due'
                      }`}>
                        {t.status === 'lunas' ? 'PAID' : 'DUE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="dash-card text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">Belum ada transaksi</p>
          <p className="text-gray-400 text-sm mb-4">Buat bon pertama untuk mulai mencatat penjualan.</p>
          <Link href="/dashboard/transactions/new" className="dash-vip-btn inline-flex" style={{ width: 'auto', padding: '0.6rem 1.25rem' }}>
            Buat Bon Baru
          </Link>
        </div>
      )}
    </div>
  )
}
