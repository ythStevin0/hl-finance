'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { formatRupiah } from '@/lib/calculations'
import type { ReportRow } from '@/lib/types/report'

interface DashboardChartProps {
  data: ReportRow[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1917] text-[#f5f5f4] p-3 rounded-lg shadow-xl border border-[#44403c] text-sm">
        <p className="font-semibold mb-1 border-b border-[#44403c] pb-1 text-[#fde68a]">{label}</p>
        <p className="font-medium">
          Omzet: {formatRupiah(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardChart({ data }: DashboardChartProps) {
  if (!data || data.length === 0) return null

  // Buat array 12 bulan statis
  const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  
  const chartData = MONTHS.map(monthName => {
    // Cari data untuk bulan ini
    const found = data.find(d => d.label.substring(0, 3) === monthName)
    return {
      name: monthName,
      value: found ? found.omzetTotal : 0
    }
  })

  const currentMonthIndex = new Date().getMonth()

  return (
    <div style={{ width: '100%', height: 260, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={32}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" radius={[6, 6, 6, 6]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === currentMonthIndex ? '#f59e0b' : '#f5f5f4'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
