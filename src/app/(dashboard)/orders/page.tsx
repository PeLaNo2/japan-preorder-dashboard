import { prisma } from "@/lib/prisma"
import { OrderTable } from "@/components/orders/order-table"
import Link from "next/link"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function OrdersPage({ searchParams }: Props) {
  const { status } = await searchParams

  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = []
  try {
    const where: Record<string, unknown> = {}
    if (status && status !== "ALL") where.status = status

    orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: { select: { name: true, sku: true } } },
        },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
  } catch {
    // Database not available (build time)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Track all customer orders</p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>
      <OrderTable orders={orders as never} statusFilter={status ?? ""} />
    </div>
  )
}
