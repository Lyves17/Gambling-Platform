export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 animate-pulse">
          <div className="h-4 w-40 bg-white/10 rounded mb-4" />
          <div className="h-10 w-80 bg-white/5 rounded mb-3" />
          <div className="h-4 w-60 bg-white/5 rounded" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/40 p-5 animate-pulse">
              <div className="h-8 w-8 bg-white/10 rounded mb-3" />
              <div className="h-3 w-24 bg-white/10 rounded mb-2" />
              <div className="h-8 w-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 animate-pulse">
            <div className="h-8 w-48 bg-white/10 rounded mb-6" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 mb-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-20 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-16 bg-white/10 rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-black/40 p-6 animate-pulse">
                <div className="h-6 w-32 bg-white/10 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-12 bg-white/5 rounded-xl" />
                  <div className="h-12 bg-white/5 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
