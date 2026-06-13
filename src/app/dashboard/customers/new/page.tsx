// src/app/dashboard/customers/new/page.tsx
import CustomerForm from '@/components/customers/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Pelanggan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Isi data pelanggan dan diskon bertingkat per tipe produk.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CustomerForm mode="new" />
      </div>
    </div>
  )
}
