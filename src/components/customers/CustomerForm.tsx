'use client'

// src/components/customers/CustomerForm.tsx
// AC-2.1–2.9: Customer CRUD dengan cascading discount steps

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cascadingDiscount, effectiveDiscountPercent, formatRupiah } from '@/lib/calculations'

interface DiscountStep {
  id?: string
  value: number
  step_order: number
}

interface CustomerFormProps {
  mode: 'new' | 'edit'
  initialData?: {
    id: string
    nama: string
    bonus_threshold: number
    steps_lm: DiscountStep[]
    steps_br: DiscountStep[]
  }
}

export default function CustomerForm({ mode, initialData }: CustomerFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [nama, setNama] = useState(initialData?.nama ?? '')
  const [bonusThreshold, setBonusThreshold] = useState(
    initialData?.bonus_threshold?.toString() ?? '10000000'
  )
  const [stepsLM, setStepsLM] = useState<DiscountStep[]>(
    initialData?.steps_lm ?? []
  )
  const [stepsBR, setStepsBR] = useState<DiscountStep[]>(
    initialData?.steps_br ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- Discount step helpers ----
  function addStep(type: 'LM' | 'BR') {
    const steps = type === 'LM' ? stepsLM : stepsBR
    const newStep: DiscountStep = { value: 0, step_order: steps.length }
    if (type === 'LM') setStepsLM([...steps, newStep])
    else setStepsBR([...steps, newStep])
  }

  function updateStep(type: 'LM' | 'BR', index: number, value: string) {
    const num = parseFloat(value)
    // AC-2.7: validasi 0–100
    if (value !== '' && (isNaN(num) || num < 0 || num > 100)) return
    const steps = type === 'LM' ? [...stepsLM] : [...stepsBR]
    steps[index] = { ...steps[index], value: isNaN(num) ? 0 : num }
    if (type === 'LM') setStepsLM(steps)
    else setStepsBR(steps)
  }

  function removeStep(type: 'LM' | 'BR', index: number) {
    const steps = type === 'LM' ? [...stepsLM] : [...stepsBR]
    steps.splice(index, 1)
    // Reorder
    const reordered = steps.map((s, i) => ({ ...s, step_order: i }))
    if (type === 'LM') setStepsLM(reordered)
    else setStepsBR(reordered)
  }

  function moveStep(type: 'LM' | 'BR', index: number, direction: 'up' | 'down') {
    const steps = type === 'LM' ? [...stepsLM] : [...stepsBR]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= steps.length) return
    ;[steps[index], steps[targetIndex]] = [steps[targetIndex], steps[index]]
    const reordered = steps.map((s, i) => ({ ...s, step_order: i }))
    if (type === 'LM') setStepsLM(reordered)
    else setStepsBR(reordered)
  }

  // ---- Submit ----
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!nama.trim()) {
      setError('Nama pelanggan wajib diisi.')
      return
    }

    const threshold = parseInt(bonusThreshold.replace(/\./g, ''), 10)
    if (isNaN(threshold) || threshold <= 0) {
      setError('Bonus threshold harus berupa angka positif.')
      return
    }

    setLoading(true)

    try {
      let customerId = initialData?.id

      if (mode === 'new') {
        const { data, error: insertError } = await supabase
          .from('customers')
          .insert({ nama: nama.trim(), bonus_threshold: threshold })
          .select('id')
          .single()

        if (insertError) throw insertError
        customerId = data.id
      } else {
        const { error: updateError } = await supabase
          .from('customers')
          .update({ nama: nama.trim(), bonus_threshold: threshold })
          .eq('id', customerId!)

        if (updateError) throw updateError
      }

      // Hapus semua discount steps lama lalu insert baru
      await supabase
        .from('customer_discount_steps')
        .delete()
        .eq('customer_id', customerId!)

      const allSteps = [
        ...stepsLM.map((s, i) => ({ customer_id: customerId!, type: 'LM' as const, step_order: i, value: s.value })),
        ...stepsBR.map((s, i) => ({ customer_id: customerId!, type: 'BR' as const, step_order: i, value: s.value })),
      ]

      if (allSteps.length > 0) {
        const { error: stepsError } = await supabase
          .from('customer_discount_steps')
          .insert(allSteps)
        if (stepsError) throw stepsError
      }

      router.push('/dashboard/customers')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nama Pelanggan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nama}
          onChange={e => setNama(e.target.value)}
          placeholder="Contoh: Toko Sinar Jaya"
          className="input-base"
          required
        />
      </div>

      {/* Bonus Threshold */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Bonus Threshold (Rp)
        </label>
        <input
          type="number"
          value={bonusThreshold}
          onChange={e => setBonusThreshold(e.target.value)}
          placeholder="10000000"
          min={1}
          className="input-base"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Pelanggan dapat 1 bonus setiap kelipatan {formatRupiah(parseInt(bonusThreshold || '0', 10))} omzet lunas.
        </p>
      </div>

      {/* Discount Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DiscountStepEditor
          type="LM"
          steps={stepsLM}
          onAdd={() => addStep('LM')}
          onUpdate={(i, v) => updateStep('LM', i, v)}
          onRemove={(i) => removeStep('LM', i)}
          onMove={(i, d) => moveStep('LM', i, d)}
        />
        <DiscountStepEditor
          type="BR"
          steps={stepsBR}
          onAdd={() => addStep('BR')}
          onUpdate={(i, v) => updateStep('BR', i, v)}
          onRemove={(i) => removeStep('BR', i)}
          onMove={(i, d) => moveStep('BR', i, d)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Menyimpan...' : mode === 'new' ? 'Tambah Pelanggan' : 'Simpan Perubahan'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Batal
        </button>
      </div>
    </form>
  )
}

// ---- Discount Step Editor Component ----
interface DiscountStepEditorProps {
  type: 'LM' | 'BR'
  steps: DiscountStep[]
  onAdd: () => void
  onUpdate: (index: number, value: string) => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: 'up' | 'down') => void
}

function DiscountStepEditor({ type, steps, onAdd, onUpdate, onRemove, onMove }: DiscountStepEditorProps) {
  const values = steps.map(s => s.value)
  const effectivePrice = cascadingDiscount(100, values)
  const effectivePct = effectiveDiscountPercent(values)

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            type === 'LM' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {type}
          </span>
          <span className="text-sm font-medium text-gray-700 ml-2">Diskon Bertingkat</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah
        </button>
      </div>

      {/* Steps */}
      {steps.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Belum ada diskon. Klik Tambah.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5 text-right">{index + 1}.</span>
              <input
                type="number"
                value={step.value}
                onChange={e => onUpdate(index, e.target.value)}
                min={0}
                max={100}
                step={0.1}
                className="input-base py-1.5 text-sm w-24"
              />
              <span className="text-xs text-gray-400">%</span>
              <div className="flex gap-0.5 ml-auto">
                <button
                  type="button"
                  onClick={() => onMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30"
                  title="Naikan"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 'down')}
                  disabled={index === steps.length - 1}
                  className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30"
                  title="Turunkan"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-1 text-gray-300 hover:text-red-500"
                  title="Hapus"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AC-2.9: Preview cascading discount */}
      {steps.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <p className="text-xs text-gray-500 mb-1">
            Preview: Harga Base 100 →{' '}
            <span className="font-semibold text-gray-700">{effectivePrice.toFixed(2)}</span>
          </p>
          <p className="text-xs text-gray-400">
            Diskon efektif: <span className="font-medium text-orange-600">{effectivePct.toFixed(2)}%</span>
            {steps.length > 1 && (
              <span className="ml-1 text-gray-300">(bukan {steps.reduce((a, b) => a + b.value, 0)}%)</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
