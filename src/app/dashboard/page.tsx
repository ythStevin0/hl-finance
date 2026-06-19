// src/app/dashboard/page.tsx
// AC-1.3: landing page setelah login

import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/calculations'
import { Banknote, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import { getCustomerSummaries, getRecentTransactions } from '@/lib/queries'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Ambil data dashboard secara paralel dengan penanganan error bawaan
  const [summaryRows, recentTransactions, { data: customerThresholds }] = await Promise.all([
    getCustomerSummaries(supabase),
    getRecentTransactions(supabase, 5),
    supabase
      .from('customers')
      .select('id, bonus_threshold')
      .is('soft_deleted_at', null),
  ])

  const totals = summaryRows.reduce(
    (acc, row) => ({
      omzet: acc.omzet + row.total_omzet_lunas,
      laba: acc.laba + row.total_laba_lunas,
      piutang: acc.piutang + row.total_piutang,
      sudahDibayar: acc.sudahDibayar + row.total_sudah_dibayar,
    }),
    { omzet: 0, laba: 0, piutang: 0, sudahDibayar: 0 }
  )

  const thresholdMap = new Map(customerThresholds?.map(c => [c.id, c.bonus_threshold]) ?? [])
  
  const customersWithBonus = summaryRows.filter(c => {
    const threshold = thresholdMap.get(c.customer_id) ?? 10_000_000
    const available = Math.floor(c.bonus_accumulator / threshold) - c.bonuses_granted
    return available > 0
  })

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
          icon={<Banknote />}
        />
        <StatCard
          label="Laba HL"
          value={formatRupiah(totals.laba)}
          description="Setelah modal"
          color="green"
          icon={<TrendingUp />}
        />
        <StatCard
          label="Piutang"
          value={formatRupiah(totals.piutang)}
          description="Belum dibayar"
          color="amber"
          icon={<Clock />}
        />
        <StatCard
          label="Sudah Dibayar"
          value={formatRupiah(totals.sudahDibayar)}
          description="Omzet + ongkir"
          color="gray"
          icon={<CheckCircle2 />}
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

