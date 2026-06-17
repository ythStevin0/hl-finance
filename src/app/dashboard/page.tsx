// src/app/dashboard/page.tsx
// AC-1.3: landing page setelah login

import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/calculations'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Summary stats — cash basis (hanya Lunas)
  const { data: summaryRows } = await supabase
    .from('customer_summary')
    .select('*')

  const totals = summaryRows?.reduce(
    (acc, row) => ({
      omzet: acc.omzet + row.total_omzet_lunas,
      laba: acc.laba + row.total_laba_lunas,
      piutang: acc.piutang + row.total_piutang,
      sudahDibayar: acc.sudahDibayar + row.total_sudah_dibayar,
    }),
    { omzet: 0, laba: 0, piutang: 0, sudahDibayar: 0 }
  ) ?? { omzet: 0, laba: 0, piutang: 0, sudahDibayar: 0 }

  // Transaksi terbaru
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select(`
      id, nomor_bon, tanggal, status, is_bonus,
      total_omzet, ongkir,
      customers (nama)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Customers dengan bonus tersedia
  const { data: bonusEligible } = await supabase
    .from('customer_summary')
    .select('customer_id, nama, bonus_accumulator, bonuses_granted')

  // Join dengan threshold dari customers
  const { data: customerThresholds } = await supabase
    .from('customers')
    .select('id, bonus_threshold')
    .is('soft_deleted_at', null)

  const thresholdMap = new Map(customerThresholds?.map(c => [c.id, c.bonus_threshold]) ?? [])
  
  const customersWithBonus = bonusEligible?.filter(c => {
    const threshold = thresholdMap.get(c.customer_id) ?? 10_000_000
    const available = Math.floor(c.bonus_accumulator / threshold) - c.bonuses_granted
    return available > 0
  }) ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan keuangan HL · Hanya transaksi Lunas (cash basis)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Omzet"
          value={formatRupiah(totals.omzet)}
          description="Lunas bulan ini"
          color="blue"
        />
        <StatCard
          label="Laba HL"
          value={formatRupiah(totals.laba)}
          description="Setelah modal"
          color="green"
        />
        <StatCard
          label="Piutang"
          value={formatRupiah(totals.piutang)}
          description="Belum dibayar"
          color="amber"
        />
        <StatCard
          label="Sudah Dibayar"
          value={formatRupiah(totals.sudahDibayar)}
          description="Omzet + ongkir"
          color="gray"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaksi Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Transaksi Terbaru</h2>
            <a href="/dashboard/transactions" className="text-xs text-blue-600 hover:text-blue-700">
              Lihat semua →
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((t) => (
                <div key={t.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {t.nomor_bon}
                        </p>
                        {t.is_bonus && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                            Bonus
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {t.customers?.nama} · {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {formatRupiah(t.total_omzet + t.ongkir)}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      t.status === 'lunas'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {t.status === 'lunas' ? 'Lunas' : 'Piutang'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                Belum ada transaksi
              </div>
            )}
          </div>
        </div>

        {/* Bonus Alert */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">
              Pelanggan Berhak Bonus
              {customersWithBonus.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {customersWithBonus.length}
                </span>
              )}
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {customersWithBonus.length > 0 ? (
              customersWithBonus.map((c) => {
                const threshold = thresholdMap.get(c.customer_id) ?? 10_000_000
                const available = Math.floor(c.bonus_accumulator / threshold) - c.bonuses_granted
                return (
                  <div key={c.customer_id} className="px-5 py-3.5 flex items-center justify-between">
                    <a
                      href={`/dashboard/customers/${c.customer_id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate"
                    >
                      {c.nama}
                    </a>
                    <span className="shrink-0 ml-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {available}× bonus
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                Tidak ada bonus tersedia
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  description,
  color,
}: {
  label: string
  value: string
  description: string
  color: 'blue' | 'green' | 'amber' | 'gray'
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-gray-50 text-gray-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colorMap[color].split(' ')[1]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
  )
}
