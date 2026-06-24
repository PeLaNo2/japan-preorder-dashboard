import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/products/product-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) notFound()

  return (
    <ProductForm
      initialData={{
        id: product.id,
        name: product.name,
        sku: product.sku,
        jpyCost: Number(product.jpyCost),
        thbPrice: Number(product.thbPrice),
        brand: product.brand ?? "",
        category: product.category ?? "",
        otherShopPrice: product.otherShopPrice ? Number(product.otherShopPrice) : 0,
        description: product.description ?? "",
        stock: product.stock,
        imageUrl: product.imageUrl ?? "",
      }}
    />
  )
}
