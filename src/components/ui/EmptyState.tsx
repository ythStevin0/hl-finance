// src/components/ui/EmptyState.tsx
// DRY — satu komponen untuk semua empty state
// Sebelumnya copy-paste di customers/page dan products/page

import Link from 'next/link'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="dash-card px-6 py-16 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
        {icon}
      </div>
      <p className="text-gray-900 font-medium mb-1">{title}</p>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="dash-vip-btn inline-flex mt-2" style={{ width: 'auto', padding: '0.6rem 1.25rem' }}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
