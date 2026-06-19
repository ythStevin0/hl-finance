// src/app/dashboard/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-28 bg-slate-200 rounded"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg"></div>
      </div>

      <div className="space-y-6 animate-pulse">
        {/* Product Group LM */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="col-span-5 h-3 bg-slate-200 rounded w-24"></div>
              <div className="col-span-3 h-3 bg-slate-200 rounded w-16 ml-auto"></div>
              <div className="col-span-3 h-3 bg-slate-200 rounded w-16 ml-auto"></div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center">
                  <div className="col-span-5 h-4 bg-slate-200 rounded w-48"></div>
                  <div className="col-span-3 h-4 bg-slate-200 rounded w-20 ml-auto"></div>
                  <div className="col-span-3 h-4 bg-slate-200 rounded w-20 ml-auto"></div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <div className="w-6 h-6 bg-slate-200 rounded"></div>
                    <div className="w-6 h-6 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Group BR */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="col-span-5 h-3 bg-slate-200 rounded w-24"></div>
              <div className="col-span-3 h-3 bg-slate-200 rounded w-16 ml-auto"></div>
              <div className="col-span-3 h-3 bg-slate-200 rounded w-16 ml-auto"></div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2].map((i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center">
                  <div className="col-span-5 h-4 bg-slate-200 rounded w-40"></div>
                  <div className="col-span-3 h-4 bg-slate-200 rounded w-20 ml-auto"></div>
                  <div className="col-span-3 h-4 bg-slate-200 rounded w-20 ml-auto"></div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <div className="w-6 h-6 bg-slate-200 rounded"></div>
                    <div className="w-6 h-6 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
