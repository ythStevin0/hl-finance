'use client'

// src/components/customers/SettleMonthButton.tsx
// AC-6.5: Settle seluruh bulan sekaligus dengan tanggal pelunasan

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/calculations'

interface Props {
  customerId: string
  month: number
  year: number
  totalPiutang: number
}

export default function SettleMonthButton({ customerId, month, year, totalPiutang }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSettle() {
    if (!paymentDate) {
      setError('Tanggal pelunasan wajib diisi.')
      return
    }
    setLoading(true)
    setError(null)

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    // AC-6.5: Update semua transaksi Piutang di bulan ini jadi Lunas
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'lunas', payment_date: paymentDate })
      .eq('customer_id', customerId)
      .eq('status', 'piutang')
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)

    setLoading(false)

    if (updateError) {
      setError('Gagal memperbarui status. Coba lagi.')
      return
    }

    setShowModal(false)
    router.refresh()
  }

  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Lunasin Bulan {MONTHS[month - 1]}
        <span className="bg-green-500 px-2 py-0.5 rounded text-xs">
          {formatRupiah(totalPiutang)}
        </span>
      </button>

      {/* Modal — AC-6.5: minta tanggal pelunasan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-1">
              Lunasin {MONTHS[month - 1]} {year}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Semua transaksi Piutang di bulan ini ({formatRupiah(totalPiutang)}) akan ditandai Lunas.
            </p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Pelunasan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="input-base"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

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
