import Link from "next/link"

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="mb-2 text-4xl font-bold text-gray-200 dark:text-gray-700">404</h1>
      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Not found</h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">This resource doesn't exist.</p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
