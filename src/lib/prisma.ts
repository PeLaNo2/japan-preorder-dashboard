import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neon } from "@neondatabase/serverless"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient(): PrismaClient | undefined {
  try {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      console.warn("[prisma] DATABASE_URL not set, skipping PrismaClient initialization")
      return undefined
    }
    const sql = neon(connectionString)
    const adapter = new PrismaNeon({ sql })
    return new PrismaClient({ adapter })
  } catch (e) {
    console.warn("[prisma] Failed to initialize PrismaClient:", e)
    return undefined
  }
}

const client = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = client
}

export { client as prisma }
