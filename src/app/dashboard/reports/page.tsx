// src/app/dashboard/reports/page.tsx
// AC-7.1: Recap per customer
// AC-7.2: Recap per tipe LM/BR
// AC-7.3: Recap overall
// AC-7.4: Filter per bulan dan tahun
// AC-7.5: Total omzet, laba, piutang, sudah dibayar
// AC-7.6: Laba HL across all customers
// AC-7.7: Bonus log terpisah
// AC-7.8: Downloadable PDF

import { createClient } from '@/lib/supabase/server'
import { getActiveCustomers } from '@/lib/queries'
import { getReportData } from '@/lib/actions/report.actions'
import { formatRupiah } from '@/lib/calculations'
import type { ReportScope, ProductTypeFilter } from '@/lib/types/report'
import ReportFilterBar from '@/components/reports/ReportFilterBar'
import ReportTable from '@/components/reports/ReportTable'
import BonusLogTable from '@/components/reports/BonusLogTable'
import DownloadPdfButton from '@/components/reports/DownloadPdfButton'
import StatCard from '@/components/ui/StatCard'

interface PageProps {
  searchParams: {
    scope?:       string
    customerId?:  string
    productType?: string
    month?:       string
    year?:        string
  }
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const now          = new Date()
  const scope        = (searchParams.scope ?? 'overall') as ReportScope
  const customerId   = searchParams.customerId ?? ''
  const productType  = (searchParams.productType ?? 'ALL') as ProductTypeFilter
  const month        = parseInt(searchParams.month ?? '0')
  const year         = parseInt(searchParams.year ?? String(now.getFullYear()))

  const [customers, reportData] = await Promise.all([
    getActiveCustomers(supabase),
    getReportData({
      scope,
      customerId:  scope === 'customer' ? customerId : undefined,
      productType: scope === 'customer' ? productType : undefined,
      month:       month > 0 ? month : undefined,
      year,
    }),
  ])

  // Build judul untuk PDF
  const scopeLabel =
    scope === 'overall'      ? 'Semua Customer' :
    scope === 'customer'     ? (customers.find(c => c.id === customerId)?.nama ?? 'Customer') :
    'Per Tipe Produk (LM/BR)'

  const monthLabel = month > 0
    ? ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][month - 1]
    : 'Semua Bulan'

  const pdfTitle    = `Laporan HL Finance — ${scopeLabel}`
  const pdfSubtitle = `${monthLabel} ${year}`
  const pdfFileName = `laporan-hl-${scope}-${year}${month > 0 ? `-${month}` : ''}`

  const { totals } = reportData

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Rekap omzet, laba, dan piutang — hanya transaksi Lunas (cash basis)
          </p>
        </div>
        {/* AC-7.8: Download PDF */}
        <DownloadPdfButton
          data={reportData}
          title={pdfTitle}
          subtitle={pdfSubtitle}
          fileName={pdfFileName}
        />
      </div>

      {/* Filter — AC-7.4 */}
      <ReportFilterBar
        customers={customers}
        currentScope={scope}
        currentCustomerId={customerId}
        currentProductType={productType}
        currentMonth={month}
        currentYear={year}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Omzet Lunas"
          value={formatRupiah(totals.omzetTotal)}
          description="Cash basis"
          color="blue"
        />
        {/* AC-7.6: Total Laba HL across all */}
        <StatCard
          label="Total Laba HL"
          value={formatRupiah(totals.labaHL)}
          description="Setelah modal"
          color="green"
        />
        <StatCard
          label="Total Piutang"
          value={formatRupiah(totals.piutang)}
          description="Belum dilunasi"
          color="amber"
        />
        <StatCard
          label="Sudah Dibayar"
          value={formatRupiah(totals.sudahDibayar)}
          description="Omzet + ongkir"
          color="gray"
        />
      </div>

      {/* Rekap Table — AC-7.5, AC-6.3 */}
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Detail Rekap · {scopeLabel} · {monthLabel} {year}
        </h2>
        <ReportTable rows={reportData.rows} totals={reportData.totals} />
      </div>

      {/* Bonus Log — AC-7.7 */}
      <BonusLogTable rows={reportData.bonusTransactions} />
    </div>
  )
}
