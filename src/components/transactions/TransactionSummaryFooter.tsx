// src/components/transactions/TransactionSummaryFooter.tsx
// AC-4.11: tampilkan total omzet, ongkir, total tagihan
// Dipisah jadi komponen sendiri — SRP, bisa dipakai di form & detail

import { formatRupiah } from '@/lib/calculations'
import type { TransactionSummary } from '@/lib/types/transaction'

interface Props {
  summary: TransactionSummary
  showLaba?: boolean // hanya tampil di internal view, bukan customer-facing
}

export default function TransactionSummaryFooter({ summary, showLaba = false }: Props) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Total Omzet</span>
        <span className="font-medium text-gray-900">{formatRupiah(summary.totalOmzet)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Ongkir</span>
        <span className="font-medium text-gray-900">{formatRupiah(summary.ongkir)}</span>
      </div>
      <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
        <span className="font-semibold text-gray-900">Total Tagihan</span>
        <span className="font-bold text-lg text-blue-600">{formatRupiah(summary.totalTagihan)}</span>
      </div>
      {/* AC-3.4: laba hanya untuk internal */}
      {showLaba && (
        <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
          <span className="text-gray-400 text-xs">Laba HL (internal)</span>
          <span className={`text-xs font-medium ${summary.totalLaba >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatRupiah(summary.totalLaba)}
          </span>
        </div>
      )}
    </div>
  )
}
