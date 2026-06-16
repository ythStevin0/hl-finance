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
  { label: 'Periode / Label', align: 'left',  width: 'w-[22%]' },
  { label: 'Omzet LM',        align: 'right', width: 'w-[13%]' },
  { label: 'Omzet BR',        align: 'right', width: 'w-[13%]' },
  { label: 'Total Omzet',     align: 'right', width: 'w-[13%]' },
  { label: 'Laba HL',         align: 'right', width: 'w-[13%]' },
  { label: 'Piutang',         align: 'right', width: 'w-[13%]' },
  { label: 'Sudah Dibayar',   align: 'right', width: 'w-[13%]' },
] as const

function RowCells({ row, isTotal = false }: { row: ReportRow; isTotal?: boolean }) {
  const textClass = isTotal ? 'font-semibold text-gray-900' : 'text-gray-700'
  const numClass  = isTotal ? 'font-semibold' : ''

  return (
    <>
      <td className={`py-3 px-4 text-sm ${textClass}`}>{row.label}</td>
      <td className={`py-3 px-4 text-sm text-right text-blue-700 ${numClass}`}>
        {formatRupiah(row.omzetLM)}
      </td>
      <td className={`py-3 px-4 text-sm text-right text-green-700 ${numClass}`}>
        {formatRupiah(row.omzetBR)}
      </td>
      <td className={`py-3 px-4 text-sm text-right text-gray-900 ${numClass}`}>
        {formatRupiah(row.omzetTotal)}
      </td>
      <td className={`py-3 px-4 text-sm text-right text-gray-900 ${numClass}`}>
        {formatRupiah(row.labaHL)}
      </td>
      <td className={`py-3 px-4 text-sm text-right text-amber-600 ${numClass}`}>
        {formatRupiah(row.piutang)}
      </td>
      <td className={`py-3 px-4 text-sm text-right text-gray-900 ${numClass}`}>
        {formatRupiah(row.sudahDibayar)}
      </td>
    </>
  )
}

export default function ReportTable({ rows, totals }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {COL_HEADER.map(col => (
              <th
                key={col.label}
                className={`py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide
                            ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.width}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <RowCells row={row} />
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                Tidak ada data untuk periode ini.
              </td>
            </tr>
          )}
        </tbody>
        {/* Total row */}
        {rows.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50">
              <RowCells row={totals} isTotal />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
