import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { OrderDetail } from "@/components/orders/order-detail"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params

  let order: Awaited<ReturnType<typeof prisma.order.findUnique>> | null = null
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true, imageUrl: true, category: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        createdBy: { select: { name: true, email: true } },
        exchangeRate: { select: { jpyToThb: true, source: true, createdAt: true } },
      },
    })
  } catch {
    notFound()
  }

  if (!order) notFound()

  return <OrderDetail order={order as never} />
}
