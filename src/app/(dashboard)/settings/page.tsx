import { prisma } from "@/lib/prisma"
import { ExchangeRateCard } from "./exchange-rate-card"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  let latest: Awaited<ReturnType<typeof prisma.exchangeRate.findFirst>> | null = null
  let history: Awaited<ReturnType<typeof prisma.exchangeRate.findMany>> = []

  try {
    latest = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    })
    history = await prisma.exchangeRate.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  } catch {
    // Database not available (build time)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage exchange rates and preferences</p>
      </div>

      <div className="space-y-6">
        <ExchangeRateCard
          latest={latest ? { jpyToThb: Number(latest.jpyToThb), source: latest.source, createdAt: latest.createdAt.toISOString() } : null}
          history={history.map((r) => ({ jpyToThb: Number(r.jpyToThb), source: r.source, createdAt: r.createdAt.toISOString() }))}
        />
      </div>
    </div>
  )
}
