"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { useState, useEffect } from "react"

const modes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
        {modes.map((m) => (
          <div key={m.value} className="rounded-md p-1.5 opacity-40">
            <m.icon className="h-4 w-4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
      {modes.map((m) => {
        const isActive = theme === m.value
        return (
          <button
            key={m.value}
            onClick={() => setTheme(m.value)}
            title={m.label}
            className={`rounded-md p-1.5 transition-all ${
              isActive
                ? "bg-indigo-100 text-indigo-600 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-300"
                : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            }`}
          >
            <m.icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
