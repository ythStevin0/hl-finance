'use client'

// src/components/reports/DownloadPdfButton.tsx
// AC-7.8: Laporan bisa didownload sebagai PDF
// AC-6.4: List piutang dan transaksi bisa didownload PDF
// Client component karena @react-pdf/renderer jalan di browser

import { useState } from 'react'
import type { ReportData } from '@/lib/types/report'

interface Props {
  data: ReportData
  title: string
  subtitle: string
  fileName: string
}

export default function DownloadPdfButton({ data, title, subtitle, fileName }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)

    try {
      // Lazy import — tidak load library PDF sampai user klik
      const { pdf } = await import('@react-pdf/renderer')
      const { default: ReportDocument } = await import('@/lib/pdf/ReportDocument')
      const React = await import('react')

      const blob = await pdf(
        React.createElement(ReportDocument, { data, title, subtitle })
      ).toBlob()

      // Trigger download
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `${fileName}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50
                 disabled:opacity-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg
                 text-sm transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      {loading ? 'Membuat PDF...' : 'Download PDF'}
    </button>
  )
}
