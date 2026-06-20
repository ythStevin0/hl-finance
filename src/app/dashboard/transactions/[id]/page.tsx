// src/app/dashboard/transactions/[id]/page.tsx
// AC-6.9: Bon detail lengkap — lines, qty, prices, ongkir, omzet, status, payment date
// AC-6.6: Settle single bon
// AC-6.8: Already-lunas tidak re-settle

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTransactionById } from '@/lib/queries'
import { formatRupiah } from '@/lib/calculations'
import SettleBonButton from '@/components/transactions/SettleBonButton'
import DeleteTransactionButton from '@/components/transactions/DeleteTransactionButton'

export default async function TransactionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const transaction = await getTransactionById(supabase, params.id)

  if (!transaction) notFound()

  const totalTagihan = transaction.total_omzet + transaction.ongkir
  const isPiutang = transaction.status === 'piutang'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-1 text-sm">
        <Link href="/dashboard/transactions" className="text-gray-400 hover:text-gray-600">
          Transaksi
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">{transaction.nomor_bon}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{transaction.nomor_bon}</h1>
            {transaction.is_bonus && <span className="dash-table-bonus">Bon Bonus</span>}
            <span className={`dash-status-badge ${
              transaction.status === 'lunas' ? 'dash-status-paid' : 'dash-status-due'
            }`}>
              {transaction.status === 'lunas' ? 'PAID' : 'DUE'}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {transaction.customers?.nama} ·{' '}
            {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
          {transaction.payment_date && (
            <p className="text-emerald-600 font-medium text-sm mt-0.5">
              Dilunasi:{' '}
              {new Date(transaction.payment_date).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AC-6.6: Settle — hanya muncul kalau masih piutang (AC-6.8) */}
          {isPiutang && (
            <SettleBonButton
              transactionId={transaction.id}
              nomorBon={transaction.nomor_bon}
              totalTagihan={totalTagihan}
            />
          )}
          <Link
            href={`/dashboard/transactions/${transaction.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
          >
            Edit
          </Link>
          <DeleteTransactionButton
            transactionId={transaction.id}
            nomorBon={transaction.nomor_bon}
          />
        </div>
      </div>

      {/* Line Items — AC-6.9 */}
      <div className="dash-card p-0 mb-6">
        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Harga/Unit</th>
                <th style={{ textAlign: 'right' }}>Omzet</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.product_type === 'LM' 
                          ? 'bg-[#f5f5f4] text-[#d97706] border border-[#e7e5e4]' 
                          : 'bg-[#1c1917] text-[#fde68a]'
                      }`}>
                        {item.product_type}
                      </span>
                      <span className="text-sm font-medium text-[#0f172a]">{item.product_nama}</span>
                      {item.is_free && (
                        <span className="text-xs text-purple-600 font-medium">(Gratis)</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="text-sm font-medium text-gray-700">{item.qty}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <p className="text-sm text-gray-900">{formatRupiah(item.discounted_unit_price)}</p>
                    {item.harga_base_snapshot !== item.discounted_unit_price && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatRupiah(item.harga_base_snapshot)}
                      </p>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <p className="text-sm font-medium text-gray-900">
                      {formatRupiah(item.line_omzet)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="dash-card bg-[#fafaf9] border-[#e7e5e4] p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 font-medium">Total Omzet</span>
          <span className="font-semibold text-gray-900">{formatRupiah(transaction.total_omzet)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 font-medium">Ongkir</span>
          <span className="font-semibold text-gray-900">{formatRupiah(transaction.ongkir)}</span>
        </div>
        <div className="flex justify-between text-base border-t border-gray-200 pt-3">
          <span className="font-bold text-[#0f172a]">Total Tagihan</span>
          <span className="font-bold text-lg text-amber-600">{formatRupiah(totalTagihan)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Laba HL (Internal)</span>
          <span className="text-xs font-bold text-emerald-600">
            {formatRupiah(transaction.total_laba)}
          </span>
        </div>
      </div>

      {/* Deskripsi */}
      {transaction.deskripsi && (
        <div className="mt-6 dash-card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Deskripsi / Catatan</p>
          <p className="text-sm text-[#0f172a] whitespace-pre-wrap">{transaction.deskripsi}</p>
        </div>
      )}
    </div>
  )
}
