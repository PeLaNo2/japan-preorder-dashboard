import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { createdAt: "desc" },
  })

  const history = await prisma.exchangeRate.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  return NextResponse.json({ latest, history })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { jpyToThb } = body

  if (!jpyToThb || jpyToThb <= 0) {
    return NextResponse.json({ error: "Invalid rate" }, { status: 400 })
  }

  const rate = await prisma.exchangeRate.create({
    data: {
      jpyToThb,
      source: "MANUAL",
    },
  })

  return NextResponse.json(rate, { status: 201 })
}
