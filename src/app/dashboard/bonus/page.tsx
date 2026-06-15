// src/app/dashboard/bonus/page.tsx
// AC-5.4: Halaman khusus bonus — semua customer dengan status bonus
// Termasuk yang belum punya bonus (untuk tracking progress)

import { getAllBonusStatuses } from '@/lib/actions/bonus.actions'
import BonusStatusCard from '@/components/bonus/BonusStatusCard'
import EmptyState from '@/components/ui/EmptyState'

export default async function BonusPage() {
  const statuses = await getAllBonusStatuses()

  // Pisah: yang punya bonus tersedia vs yang sedang progress
  const withBonus    = statuses.filter(s => s.bonusesAvailable > 0)
  const inProgress   = statuses.filter(s => s.bonusesAvailable === 0)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bonus Pelanggan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tracking akumulasi omzet dan eligibility bonus per pelanggan.
        </p>
      </div>

      {/* Bonus tersedia — AC-5.4 */}
      {withBonus.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Bonus Tersedia</h2>
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {withBonus.length} pelanggan
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {withBonus.map(status => (
              <BonusStatusCard key={status.customerId} status={status} showLink />
            ))}
          </div>
        </div>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Sedang Mengumpulkan
            <span className="ml-2 text-gray-400 font-normal">({inProgress.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgress.map(status => (
              <BonusStatusCard key={status.customerId} status={status} showLink />
            ))}
          </div>
        </div>
      )}

      {statuses.length === 0 && (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
          title="Belum ada pelanggan"
          description="Tambah pelanggan untuk mulai tracking bonus."
          actionLabel="Tambah Pelanggan"
          actionHref="/dashboard/customers/new"
        />
      )}
    </div>
  )
}
