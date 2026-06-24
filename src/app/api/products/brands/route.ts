import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const brands = await prisma.product.findMany({
    where: { brand: { not: null }, isActive: true },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  })

  return NextResponse.json(brands.map((b) => b.brand))
}
