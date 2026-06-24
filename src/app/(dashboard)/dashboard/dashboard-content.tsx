import { prisma } from "@/lib/prisma"
import { formatThb, formatJpy } from "@/lib/exchange-rate"
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentOrders } from "@/components/dashboard/recent-orders"

async function safePrisma<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function DashboardContent() {
  const allOrders = await safePrisma(
    () =>
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" } },
        select: {
          totalThbPrice: true,
          totalProfitThb: true,
          totalJpyPrice: true,
          items: { select: { quantity: true } },
        },
      }),
    []
  )

  const totalRevenueThb = allOrders.reduce((s, o) => s + Number(o.totalThbPrice), 0)
  const totalProfitThb = allOrders.reduce((s, o) => s + Number(o.totalProfitThb), 0)
  const totalOrders = allOrders.length
  const totalUnitsSold = allOrders.reduce(
    (s, o) => s + o.items.reduce((s2, i) => s2 + i.quantity, 0),
    0
  )
  const profitMargin =
    totalRevenueThb > 0
      ? ((totalProfitThb / totalRevenueThb) * 100).toFixed(1)
      : "0.0"

  const topProducts = await safePrisma(
    () =>
      prisma.product.findMany({
        where: { salesCount: { gt: 0 } },
        orderBy: { salesCount: "desc" },
        take: 5,
        select: { name: true, sku: true, salesCount: true, thbPrice: true, jpyCost: true },
      }),
    []
  )

  const topProductsWithProfit = topProducts.map((p) => ({
    name: p.name,
    sku: p.sku,
    salesCount: p.salesCount,
    profitJpy: (Number(p.thbPrice) - Number(p.jpyCost)) * p.salesCount,
  }))

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentOrdersForChart = await safePrisma(
    () =>
      prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true, totalThbPrice: true, totalProfitThb: true },
        orderBy: { createdAt: "asc" },
      }),
    []
  )

  const dailyMap = new Map<string, { revenueThb: number; profitThb: number; orders: number }>()
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i)
    dailyMap.set(d.toISOString().split("T")[0], { revenueThb: 0, profitThb: 0, orders: 0 })
  }
  for (const o of recentOrdersForChart) {
    const key = o.createdAt.toISOString().split("T")[0]
    const entry = dailyMap.get(key)
    if (entry) {
      entry.revenueThb += Number(o.totalThbPrice)
      entry.profitThb += Number(o.totalProfitThb)
      entry.orders += 1
    }
  }
  const revenueOverTime = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    revenueThb: Number(data.revenueThb.toFixed(2)),
    profitThb: Number(data.profitThb.toFixed(2)),
    orders: data.orders,
  }))

  const recentOrders = await safePrisma(
    () =>
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
          totalThbPrice: true,
          createdAt: true,
        },
      }),
    []
  )

  const latestRate = await safePrisma(
    () =>
      prisma.exchangeRate.findFirst({
        orderBy: { createdAt: "desc" },
        select: { jpyToThb: true },
      }),
    null
  )

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue (THB)"
          value={formatThb(totalRevenueThb)}
          icon={<DollarSign className="h-5 w-5" />}
          subtitle={
            latestRate
              ? `${formatJpy(allOrders.reduce((s, o) => s + Number(o.totalJpyPrice), 0))}`
              : undefined
          }
        />
        <StatCard
          title="Total Profit (THB)"
          value={formatThb(totalProfitThb)}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle={`${profitMargin}% margin`}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<ShoppingCart className="h-5 w-5" />}
          subtitle={`${totalUnitsSold} units sold`}
        />
        <StatCard
          title="Avg Order Value"
          value={totalOrders > 0 ? formatThb(totalRevenueThb / totalOrders) : "฿0"}
          icon={<Package className="h-5 w-5" />}
          subtitle="Per order average"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueOverTime as never} />
        </div>
        <TopProducts products={topProductsWithProfit} />
      </div>

      <RecentOrders
        orders={recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          status: o.status,
          totalThbPrice: Number(o.totalThbPrice),
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </>
  )
}
