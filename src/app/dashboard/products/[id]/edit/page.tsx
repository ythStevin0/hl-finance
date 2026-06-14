// src/app/dashboard/products/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/products/ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .is('soft_deleted_at', null)
    .single()

  if (!product) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
        <p className="text-gray-500 text-sm mt-1">{product.nama}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm
          mode="edit"
          initialData={{
            id: product.id,
            nama: product.nama,
            harga_modal: product.harga_modal,
            harga_base: product.harga_base,
            type: product.type,
          }}
        />
      </div>
    </div>
  )
}
