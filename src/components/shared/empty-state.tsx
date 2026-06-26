import { Package } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-600 dark:bg-gray-900">
      <div className="mb-4 rounded-full bg-gray-50 p-4 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        {icon ?? <Package className="h-8 w-8" />}
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action}
    </div>
  )
}
