// src/app/dashboard/products/new/page.tsx
import ProductForm from '@/components/products/ProductForm'

export default function NewProductPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Produk</h1>
        <p className="text-gray-500 text-sm mt-1">Isi detail produk dan harga.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm mode="new" />
      </div>
    </div>
  )
}
