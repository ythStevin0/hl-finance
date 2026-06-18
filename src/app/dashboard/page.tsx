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
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
      {/* Header */}
      <div className="dash-header">
        <h1>Dashboard</h1>
        <p>Ringkasan keuangan HL · Hanya transaksi Lunas (cash basis)</p>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats">
        <StatCard
          label="Total Omzet"
          value={formatRupiah(totals.omzet)}
          description="Lunas bulan ini"
          color="blue"
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <StatCard
          label="Laba HL"
          value={formatRupiah(totals.laba)}
          description="Setelah modal"
          color="green"
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
        <StatCard
          label="Piutang"
          value={formatRupiah(totals.piutang)}
          description="Belum dibayar"
          color="amber"
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Sudah Dibayar"
          value={formatRupiah(totals.sudahDibayar)}
          description="Omzet + ongkir"
          color="gray"
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="dash-content">
        {/* Transaksi Terbaru */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Transaksi Terbaru</h2>
            <a href="/dashboard/transactions" className="dash-section-link">
              Lihat semua →
            </a>
          </div>
          <div className="dash-tx-list">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((t) => (
                <div key={t.id} className="dash-tx-row">
                  <div className="dash-tx-info">
                    <div className="dash-tx-detail">
                      <div className="dash-tx-bon">
                        <p>{t.nomor_bon}</p>
                        {t.is_bonus && (
                          <span className="dash-tx-badge-bonus">Bonus</span>
                        )}
                      </div>
                      <p className="dash-tx-meta">
                        {t.customers?.nama} · {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="dash-tx-right">
                    <p className="dash-tx-amount">
                      {formatRupiah(t.total_omzet + t.ongkir)}
                    </p>
                    <span className={`dash-tx-status ${
                      t.status === 'lunas'
                        ? 'dash-tx-status-lunas'
                        : 'dash-tx-status-piutang'
                    }`}>
                      {t.status === 'lunas' ? 'Lunas' : 'Piutang'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="dash-empty">
                Belum ada transaksi
              </div>
            )}
          </div>
        </div>

        {/* Bonus Alert */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">
              Pelanggan Berhak Bonus
              {customersWithBonus.length > 0 && (
                <span className="dash-section-badge">
                  {customersWithBonus.length}
                </span>
              )}
            </h2>
          </div>
          <div>
            {customersWithBonus.length > 0 ? (
              customersWithBonus.map((c) => {
                const threshold = thresholdMap.get(c.customer_id) ?? 10_000_000
                const available = Math.floor(c.bonus_accumulator / threshold) - c.bonuses_granted
                return (
                  <div key={c.customer_id} className="dash-bonus-row">
                    <a
                      href={`/dashboard/customers/${c.customer_id}`}
                      className="dash-bonus-name"
                    >
                      {c.nama}
                    </a>
                    <span className="dash-bonus-count">
                      {available}× bonus
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="dash-empty">
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
  icon,
}: {
  label: string
  value: string
  description: string
  color: 'blue' | 'green' | 'amber' | 'gray'
  icon: React.ReactNode
}) {
  return (
    <div className={`dash-stat-card dash-stat-card-${color}`}>
      <div className={`dash-stat-icon dash-stat-icon-${color}`}>
        {icon}
      </div>
      <p className="dash-stat-label">{label}</p>
      <p className={`dash-stat-value dash-stat-value-${color}`}>{value}</p>
      <p className="dash-stat-desc">{description}</p>
    </div>
  )
}
