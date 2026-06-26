import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-6xl font-bold text-gray-200 dark:text-gray-700">404</h1>
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Page not found</h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">The page you're looking for doesn't exist.</p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
