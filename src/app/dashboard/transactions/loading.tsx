// src/app/dashboard/transactions/loading.tsx
export default function TransactionsLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-44 bg-slate-200 rounded"></div>
          <div className="h-4 w-28 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        {/* Table header skeleton */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
          <div className="col-span-3 h-3 bg-slate-200 rounded w-20"></div>
          <div className="col-span-3 h-3 bg-slate-200 rounded w-24"></div>
          <div className="col-span-2 h-3 bg-slate-200 rounded w-16"></div>
          <div className="col-span-2 h-3 bg-slate-200 rounded w-16 ml-auto"></div>
          <div className="col-span-2 h-3 bg-slate-200 rounded w-16 ml-auto"></div>
        </div>
        
        {/* Rows skeleton */}
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center">
              <div className="col-span-3 flex items-center gap-2">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded-full w-12"></div>
              </div>
              <div className="col-span-3 h-4 bg-slate-200 rounded w-32"></div>
              <div className="col-span-2 h-4 bg-slate-200 rounded w-20"></div>
              <div className="col-span-2 h-4 bg-slate-200 rounded w-24 ml-auto"></div>
              <div className="col-span-2 h-5 bg-slate-200 rounded-full w-16 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
