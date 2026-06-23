import { prisma } from "@/lib/prisma"
import { ProductTable } from "@/components/products/product-table"
import { ProductListHeader } from "./product-list-header"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ search?: string; category?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { search, category } = await searchParams

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []
  try {
    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }
    products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
  } catch {
    // Database not available (build time)
  }

  return (
    <div>
      <ProductListHeader />
      <ProductTable products={products} search={search ?? ""} />
    </div>
  )
}
