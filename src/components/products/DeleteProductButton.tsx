'use client'

// src/components/products/DeleteProductButton.tsx
// AC-3.5: Soft-delete produk
// Refactored: pakai ConfirmModal (DRY)

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Props {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const { error: supabaseError } = await supabase
      .from('products')
      .update({ soft_deleted_at: new Date().toISOString() })
      .eq('id', productId)

    setLoading(false)

    if (supabaseError) {
      setError('Gagal menghapus. Coba lagi.')
      return
    }

    setShowConfirm(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Hapus produk"
        aria-label={`Hapus ${productName}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {showConfirm && (
        <ConfirmModal
          title="Hapus Produk?"
          description={`"${productName}" akan disembunyikan dari katalog.`}
          warning="Riwayat transaksi yang menggunakan produk ini tetap tersimpan."
          confirmLabel="Ya, Hapus"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => { setShowConfirm(false); setError(null) }}
        />
      )}
    </>
  )
}
