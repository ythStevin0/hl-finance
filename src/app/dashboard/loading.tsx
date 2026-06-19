// src/app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
      {/* Header Skeleton */}
      <div className="animate-pulse mb-6">
        <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-64 bg-slate-200 rounded"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="dash-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dash-stat-card animate-pulse" style={{ minHeight: '115px' }}>
            <div className="w-8 h-8 rounded bg-slate-200 mb-3"></div>
            <div className="h-3 w-16 bg-slate-200 rounded mb-2"></div>
            <div className="h-5 w-24 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-20 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="dash-content mt-5">
        {/* Left Section Skeleton */}
        <div className="dash-section animate-pulse p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
            <div className="h-3 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-3 w-32 bg-slate-200 rounded"></div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-3 w-12 bg-slate-200 rounded ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section Skeleton */}
        <div className="dash-section animate-pulse p-4">
          <div className="h-4 w-36 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div className="h-4 w-28 bg-slate-200 rounded"></div>
                <div className="h-5 w-14 bg-slate-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
