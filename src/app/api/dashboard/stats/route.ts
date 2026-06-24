import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        totalThbPrice: true,
        totalProfitThb: true,
        totalJpyPrice: true,
        status: true,
        items: { select: { quantity: true } },
      },
    })

    const totalRevenueThb = orders.reduce((s, o) => s + Number(o.totalThbPrice), 0)
    const totalProfitThb = orders.reduce((s, o) => s + Number(o.totalProfitThb), 0)
    const totalRevenueJpy = orders.reduce((s, o) => s + Number(o.totalJpyPrice), 0)
    const totalOrders = orders.length
    const totalUnitsSold = orders.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.quantity, 0), 0)

    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    })

    const topProducts = await prisma.product.findMany({
      where: { salesCount: { gt: 0 } },
      orderBy: { salesCount: "desc" },
      take: 10,
      select: { name: true, sku: true, salesCount: true, thbPrice: true, jpyCost: true },
    })

    const topProductsWithProfit = topProducts.map((p) => {
      const profitPerUnit = Number(p.thbPrice) - Number(p.jpyCost)
      return {
        name: p.name,
        sku: p.sku,
        salesCount: p.salesCount,
        profitJpy: profitPerUnit * p.salesCount,
      }
    })

    return NextResponse.json({
      totalRevenueThb: Number(totalRevenueThb.toFixed(2)),
      totalProfitThb: Number(totalProfitThb.toFixed(2)),
      totalRevenueJpy: Number(totalRevenueJpy.toFixed(2)),
      totalOrders,
      totalUnitsSold,
      profitMargin: totalRevenueThb > 0 ? Number((totalProfitThb / totalRevenueThb * 100).toFixed(1)) : 0,
      ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count })),
      topProducts: topProductsWithProfit,
    })
  } catch {
    return NextResponse.json({
      totalRevenueThb: 0,
      totalProfitThb: 0,
      totalRevenueJpy: 0,
      totalOrders: 0,
      totalUnitsSold: 0,
      profitMargin: 0,
      ordersByStatus: [],
      topProducts: [],
    })
  }
}
