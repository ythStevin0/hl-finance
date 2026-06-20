// src/components/reports/ReportTable.tsx
// AC-7.5: Tabel rekap — omzet LM|BR|total, laba, piutang, sudah dibayar
// AC-6.3: LM dan BR ditampilkan terpisah
// Reusable untuk semua scope laporan (DRY)

import { formatRupiah } from '@/lib/calculations'
import type { ReportRow } from '@/lib/types/report'

interface Props {
  rows: ReportRow[]
  totals: ReportRow
}

const COL_HEADER = [
  { label: 'Periode / Label', align: 'left' },
  { label: 'Omzet LM',        align: 'right' },
  { label: 'Omzet BR',        align: 'right' },
  { label: 'Total Omzet',     align: 'right' },
  { label: 'Laba HL',         align: 'right' },
  { label: 'Piutang',         align: 'right' },
  { label: 'Sudah Dibayar',   align: 'right' },
] as const

function RowCells({ row, isTotal = false }: { row: ReportRow; isTotal?: boolean }) {
  const textClass = isTotal ? 'font-bold text-[#0f172a]' : 'font-medium text-gray-700'
  const numClass  = isTotal ? 'font-bold' : 'font-medium'

  return (
    <>
      <td><span className={`text-sm ${textClass}`}>{row.label}</span></td>
      <td style={{ textAlign: 'right' }}>
        <span className={`text-sm text-blue-700 ${numClass}`}>
          {formatRupiah(row.omzetLM)}
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span className={`text-sm text-emerald-600 ${numClass}`}>
          {formatRupiah(row.omzetBR)}
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span className={`text-sm text-gray-900 ${numClass}`}>
          {formatRupiah(row.omzetTotal)}
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span className={`text-sm text-emerald-600 ${numClass}`}>
          {formatRupiah(row.labaHL)}
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span className={`text-sm text-rose-500 ${numClass}`}>
          {formatRupiah(row.piutang)}
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span className={`text-sm text-gray-900 ${numClass}`}>
          {formatRupiah(row.sudahDibayar)}
        </span>
      </td>
    </>
  )
}

export default function ReportTable({ rows, totals }: Props) {
  return (
    <div className="dash-card p-0 overflow-hidden">
      <div className="dash-table-container">
        <table className="dash-table">
          <thead>
            <tr>
              {COL_HEADER.map(col => (
                <th
                  key={col.label}
                  style={col.align === 'right' ? { textAlign: 'right' } : {}}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, i) => (
                <tr key={i}>
                  <RowCells row={row} />
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }} className="text-gray-400">
                  Tidak ada data untuk periode ini.
                </td>
              </tr>
            )}
          </tbody>
          {/* Total row */}
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-[#fafaf9] border-t-2 border-[#e7e5e4]">
                <RowCells row={totals} isTotal />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
