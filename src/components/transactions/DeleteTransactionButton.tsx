'use client'

// src/components/transactions/DeleteTransactionButton.tsx
// AC-4.10: user can delete a transaction
// Pakai ConfirmModal yang sudah ada (DRY)

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTransaction } from '@/lib/actions/transaction.actions'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Props {
  transactionId: string
  nomorBon: string
}

export default function DeleteTransactionButton({ transactionId, nomorBon }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const result = await deleteTransaction(transactionId)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Gagal menghapus.')
      return
    }

    router.push('/dashboard/transactions')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        aria-label={`Hapus bon ${nomorBon}`}
        title="Hapus bon"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {showConfirm && (
        <ConfirmModal
          title="Hapus Bon?"
          description={`Bon "${nomorBon}" akan dihapus permanen.`}
          warning="Tindakan ini tidak bisa dibatalkan."
          confirmLabel="Ya, Hapus"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => { setShowConfirm(false); setError(null) }}
        />
      )}
    </>
  )
}
