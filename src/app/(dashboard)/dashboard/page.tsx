import { Suspense } from "react"
import { DashboardContent } from "./dashboard-content"
import { CardSkeleton } from "@/components/shared/loading-skeleton"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Your business at a glance</p>
      </div>

      <Suspense fallback={<CardSkeleton count={4} />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
