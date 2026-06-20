// src/app/dashboard/products/new/page.tsx
import ProductForm from '@/components/products/ProductForm'

import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium">
          <Link href="/dashboard/products" className="text-gray-400 hover:text-gray-600">
            Produk
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Tambah Produk</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Produk</h1>
        <p className="text-gray-500 text-sm mt-1">Isi detail produk dan harga.</p>
      </div>
      <div className="dash-card p-6 md:p-8">
        <ProductForm mode="new" />
      </div>
    </div>
  )
}
