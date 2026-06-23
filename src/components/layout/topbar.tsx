"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function Topbar() {
  const { data: session } = useSession()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div>
        <h2 className="text-sm font-medium text-gray-500">Welcome back,</h2>
        <p className="text-sm font-semibold text-gray-900">{session?.user?.name ?? "User"}</p>
      </div>
      <div className="flex items-center gap-3">
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full ring-2 ring-gray-100"
          />
        )}
        <button
          onClick={() => signOut()}
          className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-red-500 md:flex"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  )
}
