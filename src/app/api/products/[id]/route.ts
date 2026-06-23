import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(product)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const jpyCost = body.jpyCost ?? product.jpyCost
  const jpyPrice = body.jpyPrice ?? product.jpyPrice
  if (Number(jpyCost) >= Number(jpyPrice)) {
    return NextResponse.json({ error: "Cost must be less than price" }, { status: 400 })
  }

  if (body.sku && body.sku !== product.sku) {
    const existing = await prisma.product.findUnique({ where: { sku: body.sku } })
    if (existing) return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: body.name ?? undefined,
      sku: body.sku ?? undefined,
      jpyCost: body.jpyCost ?? undefined,
      jpyPrice: body.jpyPrice ?? undefined,
      category: body.category ?? undefined,
      description: body.description ?? undefined,
      stock: body.stock ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      isActive: body.isActive ?? undefined,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { orderItems: { take: 1 } },
  })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (product.orderItems.length > 0) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ message: "Product soft-deleted (has order history)" })
  }

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ message: "Product deleted" })
}
