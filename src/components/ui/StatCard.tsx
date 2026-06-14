// src/components/ui/StatCard.tsx
// DRY — dipakai di dashboard dan customer detail page

interface StatCardProps {
  label: string
  value: string
  description?: string
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'gray'
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
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${COLOR_MAP[color]}`}>{value}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
  )
}
