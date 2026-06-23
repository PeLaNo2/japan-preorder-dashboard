import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { name: true, sku: true, imageUrl: true, category: true } } },
        orderBy: { createdAt: "asc" },
      },
      createdBy: { select: { name: true, email: true } },
      exchangeRate: { select: { jpyToThb: true, source: true, createdAt: true } },
    },
  })

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return NextResponse.json({ error: "Cannot update a completed order" }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (body.status) updateData.status = body.status
  if (body.customerName) updateData.customerName = body.customerName
  if (body.customerEmail !== undefined) updateData.customerEmail = body.customerEmail
  if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone
  if (body.notes !== undefined) updateData.notes = body.notes

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      items: {
        include: { product: { select: { name: true, sku: true } } },
      },
      createdBy: { select: { name: true } },
    },
  })

  return NextResponse.json(updated)
}
