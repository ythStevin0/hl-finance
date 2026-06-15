// src/components/bonus/BonusStatusCard.tsx
// AC-5.4: Surface eligibility — tampil ketika ada bonus tersedia
// AC-5.6: Tampilkan carry over menuju bonus berikutnya

import Link from 'next/link'
import { formatRupiah } from '@/lib/calculations'
import type { BonusStatus } from '@/lib/types/bonus'

interface Props {
  status: BonusStatus
  showLink?: boolean
}

export default function BonusStatusCard({ status, showLink = true }: Props) {
  const progressPct = Math.min(
    100,
    Math.round((status.carryOver / status.threshold) * 100)
  )

  return (
    <div className={`rounded-xl border p-4 ${
      status.bonusesAvailable > 0
        ? 'bg-purple-50 border-purple-200'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          {showLink ? (
            <Link
              href={`/dashboard/customers/${status.customerId}`}
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
            >
              {status.customerNama}
            </Link>
          ) : (
            <p className="font-medium text-gray-900 text-sm">{status.customerNama}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            Bonus tiap {formatRupiah(status.threshold)}
          </p>
        </div>

        {/* Badge bonus tersedia — AC-5.4 */}
        {status.bonusesAvailable > 0 && (
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
              🎁 {status.bonusesAvailable}× tersedia
            </span>
            {showLink && (
              <Link
                href={`/dashboard/transactions/new?customer_id=${status.customerId}&bonus=true`}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Buat bon bonus →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Progress bar menuju bonus berikutnya */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Menuju bonus berikutnya</span>
          <span>{formatRupiah(status.carryOver)} / {formatRupiah(status.threshold)}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Kurang {formatRupiah(status.threshold - status.carryOver)} lagi
        </p>
      </div>
    </div>
  )
}
