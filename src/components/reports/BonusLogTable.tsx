// src/components/reports/BonusLogTable.tsx
// AC-7.7: Bonus transactions excluded dari omzet/revenue/profit totals
// Ditampilkan terpisah sebagai bonus log

import type { BonusLogRow } from '@/lib/types/report'

interface Props {
  rows: BonusLogRow[]
}

export default function BonusLogTable({ rows }: Props) {
  if (rows.length === 0) return null

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Log Bon Bonus</h3>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
          {rows.length} bon
        </span>
        <span className="text-xs text-gray-400">
          — tidak termasuk dalam omzet & laba di atas
        </span>
      </div>
      <div className="rounded-xl border border-purple-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-50 border-b border-purple-100">
              <th className="py-2.5 px-4 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">Tanggal</th>
              <th className="py-2.5 px-4 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">Nomor Bon</th>
              <th className="py-2.5 px-4 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">Pelanggan</th>
              <th className="py-2.5 px-4 text-right text-xs font-medium text-purple-600 uppercase tracking-wide">Bonus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 bg-white">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-purple-50 transition-colors">
                <td className="py-2.5 px-4 text-sm text-gray-600">
                  {new Date(row.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="py-2.5 px-4 text-sm font-medium text-purple-700">{row.nomorBon}</td>
                <td className="py-2.5 px-4 text-sm text-gray-700">{row.customerNama}</td>
                <td className="py-2.5 px-4 text-sm text-right text-purple-700 font-medium">
                  {row.quantityGranted}× bonus
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
