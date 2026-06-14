'use client'

// src/components/products/ProductForm.tsx
// AC-3.1–3.5

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/calculations'

interface Props {
  mode: 'new' | 'edit'
  initialData?: {
    id: string
    nama: string
    harga_modal: number
    harga_base: number
    type: 'LM' | 'BR'
  }
}

export default function ProductForm({ mode, initialData }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [nama, setNama] = useState(initialData?.nama ?? '')
  const [hargaModal, setHargaModal] = useState(initialData?.harga_modal?.toString() ?? '')
  const [hargaBase, setHargaBase] = useState(initialData?.harga_base?.toString() ?? '')
  const [type, setType] = useState<'LM' | 'BR'>(initialData?.type ?? 'LM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const laba = (parseInt(hargaBase || '0') - parseInt(hargaModal || '0'))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const modal = parseInt(hargaModal, 10)
    const base = parseInt(hargaBase, 10)

    if (!nama.trim()) { setError('Nama produk wajib diisi.'); return }
    // AC-3.3: harga >= 0
    if (isNaN(modal) || modal < 0) { setError('Harga modal harus angka ≥ 0.'); return }
    if (isNaN(base) || base < 0) { setError('Harga base harus angka ≥ 0.'); return }

    setLoading(true)

    const payload = { nama: nama.trim(), harga_modal: modal, harga_base: base, type }

    if (mode === 'new') {
      const { error: err } = await supabase.from('products').insert(payload)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from('products').update(payload).eq('id', initialData!.id)
      if (err) { setError(err.message); setLoading(false); return }
    }

    router.push('/dashboard/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nama Produk <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nama}
          onChange={e => setNama(e.target.value)}
          placeholder="Contoh: HL Gold 500ml"
          className="input-base"
          required
        />
      </div>

      {/* Tipe — AC-3.2: hanya LM atau BR */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tipe Produk <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {(['LM', 'BR'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                type === t
                  ? t === 'LM'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Harga */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Harga Base (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={hargaBase}
            onChange={e => setHargaBase(e.target.value)}
            placeholder="0"
            min={0}
            className="input-base"
          />
          <p className="text-xs text-gray-400 mt-1">Harga jual sebelum diskon</p>
        </div>
        <div>
          {/* AC-3.4: harga modal hanya untuk kalkulasi laba, tidak customer-facing */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Harga Modal (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={hargaModal}
            onChange={e => setHargaModal(e.target.value)}
            placeholder="0"
            min={0}
            className="input-base"
          />
          <p className="text-xs text-gray-400 mt-1">Internal — untuk kalkulasi laba</p>
        </div>
      </div>

      {/* Preview laba */}
      {hargaBase && hargaModal && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Laba per unit (tanpa diskon)</span>
          <span className={`text-sm font-semibold ${laba >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatRupiah(laba)}
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Menyimpan...' : mode === 'new' ? 'Tambah Produk' : 'Simpan Perubahan'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  )
}
