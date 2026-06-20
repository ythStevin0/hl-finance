'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { formatRupiah } from '@/lib/calculations'
import type { ReportRow } from '@/lib/types/report'

interface ReportChartsProps {
  data: ReportRow[]
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] text-white p-3 rounded-lg shadow-lg border border-slate-700 text-sm min-w-[200px]">
        {label && <p className="font-semibold mb-2 border-b border-slate-600 pb-1">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 mb-1">
            <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
            <span className="font-medium text-slate-200">
              {formatRupiah(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportCharts({ data }: ReportChartsProps) {
  // If no data, return null
  if (!data || data.length === 0) return null

  // Format data for Main Charts
  const chartData = data.map(row => ({
    name: row.label,
    'Omzet LM': row.omzetLM,
    'Omzet BR': row.omzetBR,
    'Total Omzet': row.omzetTotal,
    'Laba HL': row.labaHL
  }))

  // Data for Pie Chart (Komposisi Omzet LM vs BR)
  const totalLM = data.reduce((acc, row) => acc + row.omzetLM, 0)
  const totalBR = data.reduce((acc, row) => acc + row.omzetBR, 0)
  const totalOmzet = totalLM + totalBR

  const pieData = [
    { name: 'Logam Mulia', value: totalLM, color: '#0f172a' },
    { name: 'Perhiasan', value: totalBR, color: '#f59e0b' }
  ]
  const piePercentage = totalOmzet > 0 ? Math.round((totalLM / totalOmzet) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* LEFT COLUMN: Main Charts (Bar & Area) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Top Chart: Bar Chart (Omzet LM vs BR) */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#0f172a]">Perbandingan Omzet (LM vs BR)</h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Bar Chart</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `Rp ${value / 1000000}M`}
                  dx={-10}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                <Bar dataKey="Omzet LM" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Omzet BR" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Chart: Area Chart (Omzet Total vs Laba HL) */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#0f172a]">Tren Omzet & Laba Bersih</h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Area Chart</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLaba" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `Rp ${value / 1000000}M`}
                  dx={-10}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                <Area 
                  type="monotone" 
                  dataKey="Total Omzet" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOmzet)" 
                  activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Laba HL" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLaba)" 
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Pie Chart Panel */}
      <div className="dash-card h-full flex flex-col">
        <h3 className="text-base font-bold text-[#0f172a] mb-2 text-center">Komposisi Produk</h3>
        <p className="text-xs text-slate-500 text-center mb-6">Penjualan LM vs Perhiasan</p>
        
        <div className="relative h-[200px] w-full flex items-center justify-center mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-[#0f172a]">{piePercentage}%</span>
            <span className="text-[10px] text-slate-500 font-medium">Logam Mulia</span>
          </div>
        </div>

        {/* List items below pie chart */}
        <div className="flex-1 flex flex-col gap-4">
          {pieData.map((item, i) => (
            <div key={i} className="flex flex-col gap-1 pb-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-slate-500">{item.name}</span>
              </div>
              <span className="text-lg font-bold text-[#0f172a] ml-5">{formatRupiah(item.value)}</span>
            </div>
          ))}
          
          <div className="flex flex-col gap-1 pb-3 border-b border-slate-100 border-dashed">
            <span className="text-sm font-medium text-slate-500 ml-5">Total Omzet Keseluruhan</span>
            <span className="text-lg font-bold text-[#0f172a] ml-5">{formatRupiah(totalOmzet)}</span>
          </div>
        </div>

        <button 
          className="w-full mt-6 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
          onClick={() => document.getElementById('detail-rekap')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Check Now
        </button>
      </div>

    </div>
  )
}
