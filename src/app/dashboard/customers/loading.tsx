// src/app/dashboard/customers/loading.tsx
export default function CustomersLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-slate-200 rounded"></div>
          <div className="h-4 w-40 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-44 bg-slate-200 rounded-lg"></div>
      </div>

      {/* List Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              {/* Circular Avatar Skeleton */}
              <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0"></div>

              {/* Info Skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  <div className="h-3 w-36 bg-slate-200 rounded"></div>
                </div>
              </div>

              {/* Stats Skeleton */}
              <div className="hidden md:flex items-center gap-6 text-right shrink-0">
                <div className="space-y-1">
                  <div className="h-3 w-12 bg-slate-200 rounded ml-auto"></div>
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-slate-200 rounded ml-auto"></div>
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>

              {/* Actions Skeleton */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
