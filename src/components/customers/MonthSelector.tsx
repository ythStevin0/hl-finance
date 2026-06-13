'use client'

// src/components/customers/MonthSelector.tsx
// Pilih bulan/tahun untuk filter transaksi di customer detail

import { useRouter } from 'next/navigation'

interface Props {
  customerId: string
  currentMonth: number
  currentYear: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function MonthSelector({ customerId, currentMonth, currentYear }: Props) {
  const router = useRouter()
  const now = new Date()

  function navigate(month: number, year: number) {
    router.push(`/dashboard/customers/${customerId}?month=${month}&year=${year}`)
  }

  function prevMonth() {
    if (currentMonth === 1) navigate(12, currentYear - 1)
    else navigate(currentMonth - 1, currentYear)
  }

  function nextMonth() {
    if (currentMonth === 12) navigate(1, currentYear + 1)
    else navigate(currentMonth + 1, currentYear)
  }

  const isCurrentMonth = currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear()

  return (
    <div className="flex items-center gap-3 mb-5">
      <button
        onClick={prevMonth}
        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <span className="text-base font-semibold text-gray-900 min-w-[120px] text-center">
        {MONTHS[currentMonth - 1]} {currentYear}
      </span>

      <button
        onClick={nextMonth}
        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => navigate(now.getMonth() + 1, now.getFullYear())}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2"
        >
          Bulan ini
        </button>
      )}

      {/* Quick year selector */}
      <select
        value={currentYear}
        onChange={e => navigate(currentMonth, parseInt(e.target.value))}
        className="ml-auto text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
