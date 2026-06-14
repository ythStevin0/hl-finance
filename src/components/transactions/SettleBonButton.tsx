'use client'

// src/components/transactions/SettleBonButton.tsx
// AC-6.6: Settle satu bon dengan modal tanggal
// AC-6.8: Hanya piutang yang bisa di-settle

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { settleSingleTransaction } from '@/lib/actions/transaction.actions'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { formatRupiah } from '@/lib/calculations'

interface Props {
  transactionId: string
  nomorBon: string
  totalTagihan: number
}

export default function SettleBonButton({ transactionId, nomorBon, totalTagihan }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSettle() {
    if (!paymentDate) { setError('Tanggal pelunasan wajib diisi.'); return }
    setLoading(true)
    setError(null)

    const result = await settleSingleTransaction(transactionId, paymentDate)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Gagal memperbarui status.')
      return
    }

    setShowModal(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tandai Lunas
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Lunasin Bon {nomorBon}?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Total tagihan: <strong>{formatRupiah(totalTagihan)}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Pelunasan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="input-base"
              />
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSettle}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Lunas'}
              </button>
              <button
                onClick={() => { setShowModal(false); setError(null) }}
                className="flex-1 btn-secondary"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
