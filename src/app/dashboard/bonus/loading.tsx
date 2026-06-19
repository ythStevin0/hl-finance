// src/app/dashboard/bonus/loading.tsx
export default function BonusLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-7 w-48 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-72 bg-slate-200 rounded"></div>
      </div>

      <div className="space-y-8 animate-pulse">
        {/* Bonus Tersedia Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
            <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-slate-200 rounded"></div>
                    <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-28 bg-slate-200 rounded"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-slate-200 h-2 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sedang Mengumpulkan Section */}
        <div>
          <div className="h-4 w-36 bg-slate-200 rounded mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 w-28 bg-slate-200 rounded"></div>
                    <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    <div className="h-3 w-12 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-slate-200 h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
