// src/components/ui/ConfirmModal.tsx
// DRY — satu modal konfirmasi untuk semua delete action
// Sebelumnya ada di DeleteCustomerButton dan DeleteProductButton secara terpisah

interface ConfirmModalProps {
  title: string
  description: string
  warning?: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  description,
  warning,
  confirmLabel = 'Konfirmasi',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-1">{description}</p>
        {warning && (
          <p className="text-sm text-gray-400 mb-5">{warning}</p>
        )}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-white font-medium py-2.5 rounded-lg text-sm transition-colors ${confirmClass}`}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
          <button onClick={onCancel} className="flex-1 btn-secondary">
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
