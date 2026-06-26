import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingBag, AlertCircle } from "lucide-react"

export default async function SignInPage() {
  let session = null
  let configError = false

  try {
    session = await auth()
  } catch {
    configError = true
  }

  if (session) redirect("/dashboard")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">3A Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Japan Pre-Order Dashboard</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {configError ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-900/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Google OAuth not configured
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Add <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono dark:bg-amber-800">AUTH_GOOGLE_ID</code>,{" "}
                    <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono dark:bg-amber-800">AUTH_GOOGLE_SECRET</code>,{" "}
                    <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono dark:bg-amber-800">AUTH_SECRET</code>, and{" "}
                    <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono dark:bg-amber-800">ALLOWED_EMAILS</code>{" "}
                    in your Vercel dashboard environment variables.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome back</h2>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            Sign in with your Google account to continue
          </p>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>

        {!configError && (
          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
            Only whitelisted emails can access this dashboard
          </p>
        )}
      </div>
    </div>
  )
}
