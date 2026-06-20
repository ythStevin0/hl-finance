'use client'

// src/components/reports/DownloadReportButton.tsx
// AC-7.8: Laporan bisa didownload sebagai PDF dan Excel

import { useState, useRef, useEffect } from 'react'
import type { ReportData } from '@/lib/types/report'

interface Props {
  data: ReportData
  title: string
  subtitle: string
  fileName: string
}

export default function DownloadReportButton({ data, title, subtitle, fileName }: Props) {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleDownloadPdf() {
    setLoading(true)
    setIsOpen(false)

    try {
      // Lazy import
      const { pdf } = await import('@react-pdf/renderer')
      const { default: ReportDocument } = await import('@/lib/pdf/ReportDocument')
      const React = await import('react')

      const blob = await pdf(
        React.createElement(ReportDocument, { data, title, subtitle })
      ).toBlob()

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

  async function handleDownloadExcel() {
    setLoading(true)
    setIsOpen(false)

    try {
      const ExcelJS = (await import('exceljs')).default
      const { saveAs } = (await import('file-saver')).default

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan')

      // Add Title
      worksheet.addRow([title])
      worksheet.addRow([subtitle])
      worksheet.addRow([]) // empty row

      // Add Headers
      const headers = ['Periode / Label', 'Omzet LM', 'Omzet BR', 'Total Omzet', 'Laba HL', 'Piutang', 'Sudah Dibayar']
      const headerRow = worksheet.addRow(headers)
      headerRow.font = { bold: true }

      // Add Data Rows
      data.rows.forEach(row => {
        worksheet.addRow([
          row.label,
          row.omzetLM,
          row.omzetBR,
          row.omzetTotal,
          row.labaHL,
          row.piutang,
          row.sudahDibayar
        ])
      })

      // Add Totals
      const totalRow = worksheet.addRow([
        'TOTAL',
        data.totals.omzetLM,
        data.totals.omzetBR,
        data.totals.omzetTotal,
        data.totals.labaHL,
        data.totals.piutang,
        data.totals.sudahDibayar
      ])
      totalRow.font = { bold: true }

      // Style columns
      worksheet.columns.forEach((col, i) => {
        if (i === 0) col.width = 30 // Label
        else col.width = 18 // Numbers
      })

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, `${fileName}.xlsx`)

    } catch (err) {
      console.error('Excel generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="dash-vip-btn"
        style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        {loading ? 'Memproses...' : 'Download / Export'}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 animate-fade-in">
          <button
            onClick={handleDownloadPdf}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.25 1.5c-2.76 0-5 2.24-5 5v11c0 2.76 2.24 5 5 5h1.5c2.76 0 5-2.24 5-5v-11c0-2.76-2.24-5-5-5h-1.5zm.75 3.5h1.5v11h-1.5v-11zm-3.5 11v-11h1.5v11h-1.5z" />
            </svg>
            Format PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Format Excel
          </button>
        </div>
      )}
    </div>
  )
}
