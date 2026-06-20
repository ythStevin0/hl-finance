// src/components/ui/StatCard.tsx
// DRY — dipakai di dashboard dan customer detail page

import React from 'react'

interface StatCardProps {
  label: string
  value: string
  description?: string
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'gray'
  icon?: React.ReactNode
}

const COLOR_MAP: Record<NonNullable<StatCardProps['color']>, string> = {
  blue:   'text-blue-600',
  green:  'text-green-600',
  amber:  'text-amber-600',
  purple: 'text-purple-600',
  gray:   'text-gray-900',
}

export default function StatCard({
  label,
  value,
  description,
  color = 'gray',
  icon,
}: StatCardProps) {
  // Jika icon disediakan, menggunakan layout card dashboard dengan gradient/styling premium
  if (icon) {
    const dashColor = color === 'purple' ? 'gray' : color
    return (
      <div className={`dash-stat-card dash-stat-card-${dashColor}`}>
        <div className={`dash-stat-icon dash-stat-icon-${dashColor}`}>
          {icon}
        </div>
        <p className="dash-stat-label">{label}</p>
        <p className={`dash-stat-value dash-stat-value-${dashColor}`}>{value}</p>
        {description && <p className="dash-stat-desc">{description}</p>}
      </div>
    )
  }

  return (
    <div className="dash-card p-5 flex flex-col justify-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-xl font-bold ${COLOR_MAP[color]}`}>{value}</p>
      {description && (
        <p className="text-xs font-medium text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}

