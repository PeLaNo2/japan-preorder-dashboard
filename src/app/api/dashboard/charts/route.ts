import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const orders = await prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, totalThbPrice: true, totalProfitThb: true },
      orderBy: { createdAt: "asc" },
    })

    const dailyMap = new Map<string, { revenueThb: number; profitThb: number; orders: number }>()
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(date.getDate() + i)
      const key = date.toISOString().split("T")[0]
      dailyMap.set(key, { revenueThb: 0, profitThb: 0, orders: 0 })
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split("T")[0]
      const existing = dailyMap.get(key)
      if (existing) {
        existing.revenueThb += Number(order.totalThbPrice)
        existing.profitThb += Number(order.totalProfitThb)
        existing.orders += 1
      }
    }

    const revenueOverTime = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      revenueThb: Number(data.revenueThb.toFixed(2)),
      profitThb: Number(data.profitThb.toFixed(2)),
      orders: data.orders,
    }))

    return NextResponse.json({ revenueOverTime })
  } catch {
    return NextResponse.json({ revenueOverTime: [] })
  }
}
