'use client'

// src/components/transactions/NomorBonInput.tsx
// AC-4.2: Nomor bon required dan harus unique
// Real-time check dengan debounce — tidak spam API setiap keystroke

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string
  onChange: (value: string) => void
  excludeId?: string // saat edit: exclude ID bon sendiri dari unique check
}

type CheckStatus = 'idle' | 'checking' | 'available' | 'taken'

export default function NomorBonInput({ value, onChange, excludeId }: Props) {
  const [status, setStatus] = useState<CheckStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!value.trim()) {
      setStatus('idle')
      return
    }

    setStatus('checking')

    // Debounce 400ms — tidak check setiap keystroke (KISS)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      let query = supabase
        .from('transactions')
        .select('id')
        .eq('nomor_bon', value.trim())

      // Saat edit: exclude bon sendiri
      if (excludeId) query = query.neq('id', excludeId)

      const { data } = await query.maybeSingle()
      setStatus(data ? 'taken' : 'available')
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, excludeId])

  const statusUI: Record<CheckStatus, { icon: string; text: string; color: string } | null> = {
    idle:      null,
    checking:  { icon: '⏳', text: 'Mengecek...', color: 'text-gray-400' },
    available: { icon: '✓', text: 'Tersedia', color: 'text-green-600' },
    taken:     { icon: '✕', text: 'Sudah digunakan', color: 'text-red-600' },
  }

  const hint = statusUI[status]

  const borderColor =
    status === 'taken'     ? 'border-red-400 focus:ring-red-500' :
    status === 'available' ? 'border-green-400 focus:ring-green-500' :
    'border-gray-300 focus:ring-blue-500'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Nomor Bon <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Contoh: BON-2024-001"
          className={`input-base pr-28 ${borderColor}`}
          required
        />
        {hint && (
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${hint.color}`}>
            {hint.icon} {hint.text}
          </span>
        )}
      </div>
    </div>
  )
}
