import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? ""
  const category = searchParams.get("category") ?? ""
  const activeOnly = searchParams.get("active") !== "false"

  const where: Record<string, unknown> = {}
  if (activeOnly) where.isActive = true
  if (category) where.category = category
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, sku, jpyCost, jpyPrice, category, description, stock, imageUrl } = body

  if (!name || !sku || jpyCost == null || jpyPrice == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (Number(jpyCost) >= Number(jpyPrice)) {
    return NextResponse.json({ error: "Cost must be less than price" }, { status: 400 })
  }

  const existing = await prisma.product.findUnique({ where: { sku } })
  if (existing) {
    return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      jpyCost,
      jpyPrice,
      category: category ?? null,
      description: description ?? null,
      stock: stock ?? 0,
      imageUrl: imageUrl ?? null,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
