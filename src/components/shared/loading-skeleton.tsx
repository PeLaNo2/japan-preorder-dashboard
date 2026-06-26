export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="mb-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mb-3 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 flex-1 rounded bg-gray-50 dark:bg-gray-800/50" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-5">
          <div className="mb-3 h-4 w-24 rounded bg-gray-100" />
          <div className="mb-2 h-6 w-32 rounded bg-gray-50" />
          <div className="h-3 w-20 rounded bg-gray-50" />
        </div>
      ))}
    </div>
  )
}
