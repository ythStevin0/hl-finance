// src/app/dashboard/products/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRupiah } from '@/lib/calculations'
import DeleteProductButton from '@/components/products/DeleteProductButton'
import { getActiveProducts } from '@/lib/queries'

export default async function ProductsPage() {
  const supabase = await createClient()

  const products = await getActiveProducts(supabase)

  const lmProducts = products.filter(p => p.type === 'LM')
  const brProducts = products.filter(p => p.type === 'BR')


  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lmProducts.length} LM · {brProducts.length} BR
          </p>
        </div>
        <Link 
          href="/dashboard/products/new" 
          className="dash-vip-btn"
          style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Produk
          </div>
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="space-y-6">
          {/* LM */}
          {lmProducts.length > 0 && (
            <ProductGroup type="LM" products={lmProducts} />
          )}
          {/* BR */}
          {brProducts.length > 0 && (
            <ProductGroup type="BR" products={brProducts} />
          )}
        </div>
      ) : (
        <div className="dash-card text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">Belum ada produk</p>
          <p className="text-gray-400 text-sm mb-4">Tambah produk untuk mulai mencatat transaksi.</p>
          <Link href="/dashboard/products/new" className="dash-vip-btn inline-flex" style={{ width: 'auto', padding: '0.6rem 1.25rem' }}>
            Tambah Produk
          </Link>
        </div>
      )}
    </div>
  )
}

function ProductGroup({ type, products }: { type: 'LM' | 'BR'; products: any[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          type === 'LM' 
            ? 'bg-[#f5f5f4] text-[#d97706] border border-[#e7e5e4]' 
            : 'bg-[#1c1917] text-[#fde68a]'
        }`}>
          {type === 'LM' ? 'LOGAM MULIA (LM)' : 'PERHIASAN (BR)'}
        </span>
        <span className="text-sm font-medium text-gray-400 ml-2">{products.length} produk</span>
      </div>
      <div className="dash-card p-0 overflow-hidden">
        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th style={{ textAlign: 'right' }}>Harga Base</th>
                <th style={{ textAlign: 'right' }}>Harga Modal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="text-sm font-medium text-[#0f172a]">
                      {product.nama}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="text-sm text-gray-900">
                      {formatRupiah(product.harga_base)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="text-sm text-gray-400">
                      {formatRupiah(product.harga_modal)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.nama} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
