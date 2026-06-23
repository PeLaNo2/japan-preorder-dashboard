import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { fetchJpyToThbRate } from "@/lib/exchange-rate"

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const rate = await fetchJpyToThbRate()

    const stored = await prisma.exchangeRate.create({
      data: {
        jpyToThb: rate,
        source: "API",
      },
    })

    return NextResponse.json(stored)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch exchange rate: " + (error instanceof Error ? error.message : "Unknown") },
      { status: 502 }
    )
  }
}
