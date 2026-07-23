export default function GamesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-3xl border border-white/10 bg-black/60 p-8">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="h-12 w-64 bg-white/5 rounded mb-3" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game area skeleton */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/60 p-8">
          <div className="h-48 bg-white/5 rounded-xl mb-6" />
          <div className="h-12 bg-white/5 rounded-xl mb-4" />
          <div className="h-16 bg-white/10 rounded-xl" />
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
            <div className="h-6 w-32 bg-white/10 rounded mb-4" />
            <div className="h-16 bg-white/5 rounded-xl" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
            <div className="h-6 w-40 bg-white/10 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded" />
              <div className="h-4 bg-white/5 rounded" />
              <div className="h-4 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
