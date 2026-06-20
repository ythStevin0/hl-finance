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

  const isAvailable = status.bonusesAvailable > 0

  return (
    <div className={`rounded-2xl border p-5 transition-all ${
      isAvailable
        ? 'bg-[linear-gradient(135deg,#1c1917,#0a0a0a)] border-[#292524] shadow-lg'
        : 'bg-white border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          {showLink ? (
            <Link
              href={`/dashboard/customers/${status.customerId}`}
              className={`font-bold transition-colors text-sm ${
                isAvailable ? 'text-[#fde68a] hover:text-[#fcd34d]' : 'text-[#0f172a] hover:text-[#d97706]'
              }`}
            >
              {status.customerNama}
            </Link>
          ) : (
            <p className={`font-bold text-sm ${isAvailable ? 'text-[#fde68a]' : 'text-[#0f172a]'}`}>
              {status.customerNama}
            </p>
          )}
          <p className={`text-xs mt-1 ${isAvailable ? 'text-gray-400' : 'text-gray-500'}`}>
            Bonus tiap {formatRupiah(status.threshold)}
          </p>
        </div>

        {/* Badge bonus tersedia — AC-5.4 */}
        {isAvailable && (
          <div className="shrink-0 flex flex-col items-end gap-2">
            <span className="dash-table-bonus">
              🎁 {status.bonusesAvailable}× tersedia
            </span>
            {showLink && (
              <Link
                href={`/dashboard/transactions/new?customer_id=${status.customerId}&bonus=true`}
                className="text-xs text-[#fde68a] hover:text-[#fcd34d] font-bold border border-[#292524] bg-[#292524]/50 px-2.5 py-1 rounded-md transition-colors"
              >
                Buat bon bonus →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Progress bar menuju bonus berikutnya */}
      <div>
        <div className={`flex justify-between text-xs mb-1.5 font-medium ${isAvailable ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>Menuju bonus berikutnya</span>
          <span className={isAvailable ? 'text-gray-300' : 'text-[#0f172a]'}>
            {formatRupiah(status.carryOver)} / {formatRupiah(status.threshold)}
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isAvailable ? 'bg-[#292524]' : 'bg-gray-100'}`}>
          <div
            className="h-full bg-[linear-gradient(90deg,#d97706,#f59e0b)] rounded-full transition-all duration-500 relative"
            style={{ width: `${progressPct}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full" />
          </div>
        </div>
        <p className={`text-xs mt-2 ${isAvailable ? 'text-gray-400' : 'text-gray-500'}`}>
          Kurang <span className="font-semibold">{formatRupiah(status.threshold - status.carryOver)}</span> lagi
        </p>
      </div>
    </div>
  )
}
