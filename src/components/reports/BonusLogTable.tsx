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
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Log Bon Bonus</h3>
        <span className="dash-table-bonus">
          {rows.length} bon
        </span>
        <span className="text-xs text-gray-400">
          — tidak termasuk dalam omzet & laba di atas
        </span>
      </div>
      <div className="dash-card p-0 overflow-hidden">
        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nomor Bon</th>
                <th>Pelanggan</th>
                <th style={{ textAlign: 'right' }}>Bonus</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="text-gray">
                    {new Date(row.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <span className="text-sm font-medium text-[#0f172a]">{row.nomorBon}</span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-700">{row.customerNama}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="dash-table-bonus">
                      {row.quantityGranted}× bonus
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
