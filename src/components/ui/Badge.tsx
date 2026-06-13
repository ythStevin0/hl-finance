// src/components/ui/Badge.tsx
// Reusable badge — DRY, tidak ada warna inline berulang di mana-mana

interface BadgeProps {
  variant: 'lunas' | 'piutang' | 'bonus' | 'lm' | 'br'
  children: React.ReactNode
}

const VARIANT_CLASSES: Record<BadgeProps['variant'], string> = {
  lunas:   'bg-green-100 text-green-700',
  piutang: 'bg-yellow-100 text-yellow-700',
  bonus:   'bg-purple-100 text-purple-700',
  lm:      'bg-blue-100 text-blue-700',
  br:      'bg-green-100 text-green-700',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  )
}
