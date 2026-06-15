'use client'

// src/components/bonus/BonusGrantSelector.tsx
// AC-5.5: User memilih berapa bonus dikonsumsi dalam 1 bon
// AC-5.3: Tidak bisa melebihi bonus yang tersedia

import { formatRupiah } from '@/lib/calculations'
import type { BonusStatus } from '@/lib/types/bonus'

interface Props {
  status: BonusStatus
  quantityGranted: number
  onChange: (qty: number) => void
}

export default function BonusGrantSelector({ status, quantityGranted, onChange }: Props) {
  if (status.bonusesAvailable === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm font-medium text-yellow-800">
          Pelanggan ini belum punya bonus tersedia
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Accumulator: {formatRupiah(status.accumulator)} — butuh {formatRupiah(status.threshold)} untuk 1 bonus
        </p>
      </div>
    )
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-purple-900">
            🎁 Bonus Tersedia: {status.bonusesAvailable}×
          </p>
          <p className="text-xs text-purple-600 mt-0.5">
            Accumulator: {formatRupiah(status.accumulator)}
          </p>
        </div>
      </div>

      {/* Pilih berapa bonus dikonsumsi — AC-5.5 */}
      <div>
        <label className="block text-xs font-medium text-purple-800 mb-2">
          Jumlah bonus yang dikonsumsi di bon ini:
        </label>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: status.bonusesAvailable }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                quantityGranted === n
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
              }`}
            >
              {n}×
            </button>
          ))}
        </div>

        {/* Preview konsumsi & carry over — AC-5.6 */}
        {quantityGranted > 0 && (
          <div className="mt-3 bg-white rounded-lg border border-purple-200 p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Dikonsumsi</span>
              <span className="font-medium text-red-600">
                − {formatRupiah(quantityGranted * status.threshold)}
              </span>
            </div>
            <div className="flex justify-between text-xs border-t border-gray-100 pt-1.5">
              <span className="text-gray-500">Carry over ke bonus berikutnya</span>
              <span className="font-medium text-purple-700">
                {formatRupiah(status.carryOver)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
