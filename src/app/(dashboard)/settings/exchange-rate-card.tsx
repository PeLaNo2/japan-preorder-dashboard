"use client"

import { useState } from "react"
import { RefreshCw, Database, Globe } from "lucide-react"
import { toast } from "sonner"
import { formatDateTime } from "@/lib/utils"

interface RateEntry {
  jpyToThb: number
  source: string
  createdAt: string
}

interface Props {
  latest: RateEntry | null
  history: RateEntry[]
}

export function ExchangeRateCard({ latest, history }: Props) {
  const [refreshing, setRefreshing] = useState(false)
  const [manualRate, setManualRate] = useState("")
  const [currentLatest, setCurrentLatest] = useState<RateEntry | null>(latest)

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/exchange-rates/refresh", { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to refresh")
        return
      }
      const data = await res.json()
      setCurrentLatest({
        jpyToThb: Number(data.jpyToThb),
        source: data.source,
        createdAt: data.createdAt,
      })
      toast.success("Exchange rate updated")
    } catch {
      toast.error("Failed to refresh exchange rate")
    } finally {
      setRefreshing(false)
    }
  }

  async function handleManualOverride(e: React.FormEvent) {
    e.preventDefault()
    const rate = parseFloat(manualRate)
    if (!rate || rate <= 0) {
      toast.error("Enter a valid rate")
      return
    }

    try {
      const res = await fetch("/api/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jpyToThb: rate }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to set rate")
        return
      }
      const data = await res.json()
      setCurrentLatest({
        jpyToThb: Number(data.jpyToThb),
        source: data.source,
        createdAt: data.createdAt,
      })
      setManualRate("")
      toast.success("Manual rate saved")
    } catch {
      toast.error("Failed to save rate")
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">JPY / THB Exchange Rate</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Used for automatic profit calculation in THB
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {currentLatest && (
          <div className="mb-5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-4 dark:from-indigo-950 dark:to-blue-950">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                1 JPY = {currentLatest.jpyToThb.toFixed(6)} THB
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  currentLatest.source === "API"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
              >
                {currentLatest.source}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Last updated: {formatDateTime(currentLatest.createdAt)}
            </p>
          </div>
        )}

        {!currentLatest && (
          <div className="mb-5 rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            No exchange rate data yet. Click &quot;Refresh&quot; to fetch the latest rate.
          </div>
        )}

        <form onSubmit={handleManualOverride} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">
              Manual Override
            </label>
            <input
              type="number"
              step="0.000001"
              min="0.000001"
              placeholder="0.237500"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-700"
          >
            Set Rate
          </button>
        </form>
      </div>

      {history.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rate History (Last 50)</h2>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {history.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    1 JPY = {entry.jpyToThb.toFixed(6)} THB
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      entry.source === "API"
                        ? "bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                  >
                    {entry.source}
                  </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDateTime(entry.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
