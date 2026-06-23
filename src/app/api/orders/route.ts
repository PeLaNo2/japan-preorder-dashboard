import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { fetchJpyToThbRate } from "@/lib/exchange-rate"

async function getOrRefreshExchangeRate(): Promise<{ id: string; jpyToThb: number }> {
  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { createdAt: "desc" },
  })

  if (latest) {
    const age = Date.now() - latest.createdAt.getTime()
    const oneHour = 60 * 60 * 1000
    if (age < oneHour) {
      return { id: latest.id, jpyToThb: Number(latest.jpyToThb) }
    }
  }

  try {
    const rate = await fetchJpyToThbRate()
    const stored = await prisma.exchangeRate.create({
      data: { jpyToThb: rate, source: "API" },
    })
    return { id: stored.id, jpyToThb: Number(stored.jpyToThb) }
  } catch {
    if (latest) return { id: latest.id, jpyToThb: Number(latest.jpyToThb) }
    throw new Error("No exchange rate available")
  }
}

async function generateOrderNumber(): Promise<string> {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const prefix = `ORD-${y}${m}${d}-`

  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  })

  const nextNum = lastOrder
    ? String(Number(lastOrder.orderNumber.slice(-4)) + 1).padStart(4, "0")
    : "0001"

  return `${prefix}${nextNum}`
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: { product: { select: { name: true, sku: true, imageUrl: true } } },
      },
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { customerName, customerEmail, customerPhone, notes, items } = body

  if (!customerName || !items || items.length === 0) {
    return NextResponse.json({ error: "Customer name and at least one item required" }, { status: 400 })
  }

  const rate = await getOrRefreshExchangeRate()

  const orderNumber = await generateOrderNumber()

  const order = await prisma.$transaction(async (tx) => {
    let totalJpyCost = 0
    let totalJpyPrice = 0
    let totalProfitJpy = 0
    let totalThbCost = 0
    let totalThbPrice = 0
    let totalProfitThb = 0

    const orderItemsData = []

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) throw new Error(`Product ${item.productId} not found`)
      if (!product.isActive) throw new Error(`Product ${product.name} is inactive`)
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (available: ${product.stock}, needed: ${item.quantity})`)
      }

      const qty = item.quantity
      const unitJpyCost = Number(product.jpyCost)
      const unitJpyPrice = Number(product.jpyPrice)
      const itemTotalJpyCost = unitJpyCost * qty
      const itemTotalJpyPrice = unitJpyPrice * qty
      const itemProfitJpy = itemTotalJpyPrice - itemTotalJpyCost

      const unitThbCost = unitJpyCost * rate.jpyToThb
      const unitThbPrice = unitJpyPrice * rate.jpyToThb
      const itemTotalThbCost = itemTotalJpyCost * rate.jpyToThb
      const itemTotalThbPrice = itemTotalJpyPrice * rate.jpyToThb
      const itemProfitThb = itemTotalThbPrice - itemTotalThbCost

      totalJpyCost += itemTotalJpyCost
      totalJpyPrice += itemTotalJpyPrice
      totalProfitJpy += itemProfitJpy
      totalThbCost += itemTotalThbCost
      totalThbPrice += itemTotalThbPrice
      totalProfitThb += itemProfitThb

      orderItemsData.push({
        productId: product.id,
        quantity: qty,
        unitJpyCost,
        unitJpyPrice,
        totalJpyCost: itemTotalJpyCost,
        totalJpyPrice: itemTotalJpyPrice,
        profitJpy: itemProfitJpy,
        unitThbCost,
        unitThbPrice,
        totalThbCost: itemTotalThbCost,
        totalThbPrice: itemTotalThbPrice,
        profitThb: itemProfitThb,
      })

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: qty },
          salesCount: { increment: qty },
        },
      })
    }

    return tx.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail: customerEmail ?? null,
        customerPhone: customerPhone ?? null,
        notes: notes ?? null,
        totalJpyCost,
        totalJpyPrice,
        totalProfitJpy,
        totalThbCost,
        totalThbPrice,
        totalProfitThb,
        exchangeRateId: rate.id,
        createdById: session.user.id,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true, sku: true, imageUrl: true } } },
        },
        createdBy: { select: { name: true } },
        exchangeRate: { select: { jpyToThb: true, source: true } },
      },
    })
  })

  return NextResponse.json(order, { status: 201 })
}
