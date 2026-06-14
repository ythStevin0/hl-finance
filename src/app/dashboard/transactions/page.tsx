// src/app/dashboard/transactions/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRupiah } from '@/lib/calculations'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, customers(nama)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi (Bon)</h1>
          <p className="text-gray-500 text-sm mt-1">{transactions?.length ?? 0} bon terakhir</p>
        </div>
        <Link href="/dashboard/transactions/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Bon Baru
        </Link>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <div className="col-span-3">Nomor Bon</div>
            <div className="col-span-3">Pelanggan</div>
            <div className="col-span-2">Tanggal</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <div className="divide-y divide-gray-50">
            {transactions.map(t => (
              <Link
                key={t.id}
                href={`/dashboard/transactions/${t.id}`}
                className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">{t.nomor_bon}</span>
                    {t.is_bonus && <Badge variant="bonus">Bonus</Badge>}
                  </div>
                </div>
                <div className="col-span-3">
                  {/* @ts-expect-error supabase join */}
                  <span className="text-sm text-gray-700">{t.customers?.nama ?? '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">
                    {new Date(t.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatRupiah(t.total_omzet + t.ongkir)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <Badge variant={t.status === 'lunas' ? 'lunas' : 'piutang'}>
                    {t.status === 'lunas' ? 'Lunas' : 'Piutang'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          }
          title="Belum ada transaksi"
          description="Buat bon pertama untuk mulai mencatat penjualan."
          actionLabel="Buat Bon Baru"
          actionHref="/dashboard/transactions/new"
        />
      )}
    </div>
  )
}
