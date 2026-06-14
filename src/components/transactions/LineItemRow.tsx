'use client'

// src/components/transactions/LineItemRow.tsx
// AC-4.4: produk dari katalog (bukan free text)
// AC-4.5: qty >= 1
// AC-4.6: tampilkan tipe & harga setelah diskon
// AC-4.7: diskon otomatis dari customer × product type

import { formatRupiah, effectiveDiscountPercent } from '@/lib/calculations'
import type { LineItemDraft } from '@/lib/types/transaction'
import type { Product } from '@/lib/supabase/types'
import Badge from '@/components/ui/Badge'

interface Props {
  item: LineItemDraft
  products: Product[]           // katalog aktif
  discountMap: Record<'LM' | 'BR', number[]>
  canRemove: boolean
  onProductChange: (productId: string | null) => void
  onQtyChange: (qty: number) => void
  onRemove: () => void
}

export default function LineItemRow({
  item,
  products,
  discountMap,
  canRemove,
  onProductChange,
  onQtyChange,
  onRemove,
}: Props) {
  const steps = item.product ? discountMap[item.product.type] ?? [] : []
  const effectivePct = steps.length > 0 ? effectiveDiscountPercent(steps) : 0

  return (
    <div className="grid grid-cols-12 gap-3 items-start py-3 border-b border-gray-100 last:border-0">

      {/* Pilih Produk — AC-4.4 */}
      <div className="col-span-5">
        <select
          value={item.product?.id ?? ''}
          onChange={e => onProductChange(e.target.value || null)}
          className="input-base text-sm"
        >
          <option value="">— Pilih Produk —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              [{p.type}] {p.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Qty — AC-4.5: min 1 */}
      <div className="col-span-2">
        <input
          type="number"
          value={item.qty}
          min={1}
          onChange={e => onQtyChange(parseInt(e.target.value) || 1)}
          className="input-base text-sm text-center"
        />
      </div>

      {/* Harga & Diskon — AC-4.6, 4.7 */}
      <div className="col-span-4">
        {item.product ? (
          <div className="pt-2.5">
            <div className="flex items-center gap-2">
              <Badge variant={item.product.type === 'LM' ? 'lm' : 'br'}>
                {item.product.type}
              </Badge>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(item.discountedUnitPrice)}
              </span>
            </div>
            {steps.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                Diskon {effectivePct.toFixed(1)}% dari {formatRupiah(item.product.harga_base)}
              </p>
            )}
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              = {formatRupiah(item.lineOmzet)}
            </p>
          </div>
        ) : (
          <div className="pt-2.5 text-xs text-gray-300">Pilih produk dulu</div>
        )}
      </div>

      {/* Hapus baris */}
      <div className="col-span-1 flex justify-end pt-2.5">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Hapus baris ini"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
