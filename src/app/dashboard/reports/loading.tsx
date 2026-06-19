// src/app/dashboard/reports/loading.tsx
export default function ReportsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-slate-200 rounded"></div>
          <div className="h-4 w-96 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3" style={{ minHeight: '115px' }}>
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-6 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-20 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="mb-2 animate-pulse space-y-4">
        <div className="h-4 w-64 bg-slate-200 rounded"></div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-span-3 h-3 bg-slate-200 rounded w-20"></div>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="col-span-3 h-4 bg-slate-200 rounded w-28"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
