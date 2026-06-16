'use client'

// src/components/reports/ReportFilterBar.tsx
// AC-7.4: Filter per bulan dan per tahun
// AC-7.1–7.3: Switch scope: overall, per customer, per tipe

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { MONTH_NAMES_LONG, YEAR_RANGE_BACK, YEAR_RANGE_FORWARD } from '@/lib/constants'
import type { Customer } from '@/lib/supabase/types'
import type { ReportScope, ProductTypeFilter } from '@/lib/types/report'

interface Props {
  customers: Customer[]
  currentScope: ReportScope
  currentCustomerId: string
  currentProductType: ProductTypeFilter
  currentMonth: number   // 0 = semua bulan
  currentYear: number
}

export default function ReportFilterBar({
  customers,
  currentScope,
  currentCustomerId,
  currentProductType,
  currentMonth,
  currentYear,
}: Props) {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()

  // Update query params tanpa full reload
  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    // Reset page-specific params saat scope berubah
    if (key === 'scope') {
      params.delete('customerId')
      params.delete('productType')
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const now  = new Date()
  const years = Array.from(
    { length: YEAR_RANGE_BACK + YEAR_RANGE_FORWARD + 1 },
    (_, i) => now.getFullYear() - YEAR_RANGE_BACK + i
  )

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-4">
      {/* Scope selector — AC-7.1, 7.2, 7.3 */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Jenis Laporan</p>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: 'overall',      label: 'Semua Customer' },
            { value: 'customer',     label: 'Per Customer'   },
            { value: 'product-type', label: 'Per Tipe (LM/BR)' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => updateParam('scope', opt.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentScope === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer picker — hanya muncul kalau scope=customer */}
      {currentScope === 'customer' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Pelanggan</p>
            <select
              value={currentCustomerId}
              onChange={e => updateParam('customerId', e.target.value)}
              className="input-base text-sm"
            >
              <option value="">— Pilih Pelanggan —</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Filter Tipe</p>
            <div className="flex gap-2">
              {(['ALL', 'LM', 'BR'] as ProductTypeFilter[]).map(t => (
                <button
                  key={t}
                  onClick={() => updateParam('productType', t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentProductType === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t === 'ALL' ? 'Semua' : t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Year + Month filter — AC-7.4 */}
      <div className="flex gap-3 flex-wrap">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Tahun</p>
          <select
            value={currentYear}
            onChange={e => updateParam('year', e.target.value)}
            className="input-base text-sm w-28"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Bulan</p>
          <select
            value={currentMonth}
            onChange={e => updateParam('month', e.target.value)}
            className="input-base text-sm w-36"
          >
            <option value="0">Semua Bulan</option>
            {MONTH_NAMES_LONG.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
