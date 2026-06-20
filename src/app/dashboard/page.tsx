import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/calculations'
import { Banknote, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { getCustomerSummaries, getRecentTransactions } from '@/lib/queries'
import { getReportData } from '@/lib/actions/report.actions'
import DashboardChart from '@/components/dashboard/DashboardChart'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch all required data in parallel
  const [
    summaryRows, 
    recentTransactions, 
    { data: customerThresholds },
    reportData // For the new Bar Chart
  ] = await Promise.all([
    getCustomerSummaries(supabase),
    getRecentTransactions(supabase, 5),
    supabase
      .from('customers')
      .select('id, bonus_threshold')
      .is('soft_deleted_at', null),
    getReportData({ scope: 'overall', year: new Date().getFullYear() })
  ])

  // Top Stats
  const totals = summaryRows.reduce(
    (acc, row) => ({
      omzet: acc.omzet + row.total_omzet_lunas,
      laba: acc.laba + row.total_laba_lunas,
      piutang: acc.piutang + row.total_piutang,
      sudahDibayar: acc.sudahDibayar + row.total_sudah_dibayar,
    }),
    { omzet: 0, laba: 0, piutang: 0, sudahDibayar: 0 }
  )

  // VIP Bonus Logic
  const thresholdMap = new Map(customerThresholds?.map(c => [c.id, c.bonus_threshold]) ?? [])
  
  const customersWithBonus = summaryRows.filter(c => {
    const threshold = thresholdMap.get(c.customer_id) ?? 10_000_000
    const available = Math.floor(c.bonus_accumulator / threshold) - c.bonuses_granted
    return available > 0
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan omzet, laba, piutang, dan status bonus pelanggan Anda.
        </p>
      </div>

      {/* 1. TOP ROW: Unified Stat Block */}
      <div className="dash-top-block">
        <div className="dash-stat-item">
          <div className="dash-stat-header">
            <div className="dash-stat-circle dash-stat-circle-orange">
              <Banknote />
            </div>
            <p className="dash-stat-title">Total Omzet</p>
          </div>
          <p className="dash-stat-value">{formatRupiah(totals.omzet)}</p>
        </div>

        <div className="dash-stat-item">
          <div className="dash-stat-header">
            <div className="dash-stat-circle dash-stat-circle-green">
              <TrendingUp />
            </div>
            <p className="dash-stat-title">Laba HL</p>
          </div>
          <p className="dash-stat-value">{formatRupiah(totals.laba)}</p>
        </div>

        <div className="dash-stat-item">
          <div className="dash-stat-header">
            <div className="dash-stat-circle dash-stat-circle-blue">
              <Clock />
            </div>
            <p className="dash-stat-title">Piutang</p>
          </div>
          <p className="dash-stat-value">{formatRupiah(totals.piutang)}</p>
        </div>

        <div className="dash-stat-item">
          <div className="dash-stat-header">
            <div className="dash-stat-circle dash-stat-circle-red">
              <CheckCircle2 />
            </div>
            <p className="dash-stat-title">Sudah Dibayar</p>
          </div>
          <p className="dash-stat-value">{formatRupiah(totals.sudahDibayar)}</p>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Split Layout (Chart & VIP Card) */}
      <div className="dash-middle-row">
        {/* Left: Monthly Revenue Chart */}
        <div className="dash-card">
          <p className="dash-card-title">Monthly Revenue</p>
          <p className="dash-card-subtitle">{formatRupiah(totals.omzet)}</p>
          <DashboardChart data={reportData.rows} />
        </div>

        {/* Right: VIP Bonus Card (Deep Charcoal) */}
        <div className="dash-vip-card">
          <div>
            <span className="dash-vip-badge">NEW</span>
            <h2 className="dash-vip-title">
              {customersWithBonus.length > 0 
                ? `${customersWithBonus.length} Pelanggan Berhak Bonus!`
                : 'Belum ada bonus siap cair.'}
            </h2>
            <p className="dash-vip-desc">
              {customersWithBonus.length > 0
                ? 'Ada pelanggan yang sudah melewati batas omzet. Cek dan cairkan bonus mereka sekarang.'
                : 'Terus tingkatkan omzet pelanggan untuk membuka reward bonus mereka.'}
            </p>
          </div>
          <a href="/dashboard/customers" className="dash-vip-btn">
            {customersWithBonus.length > 0 ? 'Lihat Sekarang' : 'Cek Pelanggan'}
          </a>
        </div>
      </div>

      {/* 3. BOTTOM ROW: Recent Transactions Table */}
      <div className="dash-card">
        <p className="dash-card-title" style={{ marginBottom: '1rem' }}>Recent Invoices</p>
        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Date Created</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {t.nomor_bon}
                      {t.is_bonus && <span className="dash-table-bonus">Bonus</span>}
                    </td>
                    <td className="text-gray">
                      {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>{t.customers?.nama}</td>
                    <td>{formatRupiah(t.total_omzet + t.ongkir)}</td>
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
                    Belum ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
