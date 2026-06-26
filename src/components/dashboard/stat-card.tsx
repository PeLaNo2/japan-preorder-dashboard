interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">{icon}</div>
        {trend && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.positive
                ? "bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                : "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
    </div>
  )
}
