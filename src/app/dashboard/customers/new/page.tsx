// src/app/dashboard/customers/new/page.tsx
import CustomerForm from '@/components/customers/CustomerForm'

import Link from 'next/link'

export default function NewCustomerPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium">
          <Link href="/dashboard/customers" className="text-gray-400 hover:text-gray-600">
            Pelanggan
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Tambah Pelanggan</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Pelanggan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Isi data pelanggan dan diskon bertingkat per tipe produk.
        </p>
      </div>
      <div className="dash-card p-6 md:p-8">
        <CustomerForm mode="new" />
      </div>
    </div>
  )
}
