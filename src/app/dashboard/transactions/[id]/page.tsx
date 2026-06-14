// src/app/dashboard/transactions/[id]/page.tsx
// AC-6.9: Bon detail lengkap — lines, qty, prices, ongkir, omzet, status, payment date
// AC-6.6: Settle single bon
// AC-6.8: Already-lunas tidak re-settle

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTransactionById } from '@/lib/queries'
import { formatRupiah } from '@/lib/calculations'
import Badge from '@/components/ui/Badge'
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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{transaction.nomor_bon}</h1>
            {transaction.is_bonus && <Badge variant="bonus">Bon Bonus</Badge>}
            <Badge variant={transaction.status === 'lunas' ? 'lunas' : 'piutang'}>
              {transaction.status === 'lunas' ? 'Lunas' : 'Piutang'}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {/* @ts-expect-error supabase join */}
            {transaction.customers?.nama} ·{' '}
            {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
          {transaction.payment_date && (
            <p className="text-green-600 text-sm mt-0.5">
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
            className="btn-secondary"
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <div className="col-span-5">Produk</div>
            <div className="col-span-1 text-center">Qty</div>
            <div className="col-span-3 text-right">Harga/Unit</div>
            <div className="col-span-3 text-right">Omzet</div>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {transaction.items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center">
              <div className="col-span-5">
                <div className="flex items-center gap-2">
                  <Badge variant={item.product_type === 'LM' ? 'lm' : 'br'}>
                    {item.product_type}
                  </Badge>
                  <span className="text-sm text-gray-900">{item.product_nama}</span>
                  {item.is_free && (
                    <span className="text-xs text-purple-600 font-medium">(Gratis)</span>
                  )}
                </div>
              </div>
              <div className="col-span-1 text-center text-sm text-gray-600">
                {item.qty}
              </div>
              <div className="col-span-3 text-right">
                <p className="text-sm text-gray-900">{formatRupiah(item.discounted_unit_price)}</p>
                {item.harga_base_snapshot !== item.discounted_unit_price && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatRupiah(item.harga_base_snapshot)}
                  </p>
                )}
              </div>
              <div className="col-span-3 text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatRupiah(item.line_omzet)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Omzet</span>
          <span className="font-medium">{formatRupiah(transaction.total_omzet)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ongkir</span>
          <span className="font-medium">{formatRupiah(transaction.ongkir)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
          <span className="font-semibold text-gray-900">Total Tagihan</span>
          <span className="font-bold text-lg text-blue-600">{formatRupiah(totalTagihan)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
          <span className="text-xs text-gray-400">Laba HL (internal)</span>
          <span className="text-xs font-medium text-green-600">
            {formatRupiah(transaction.total_laba)}
          </span>
        </div>
      </div>

      {/* Deskripsi */}
      {transaction.deskripsi && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Deskripsi</p>
          <p className="text-sm text-gray-700">{transaction.deskripsi}</p>
        </div>
      )}
    </div>
  )
}
