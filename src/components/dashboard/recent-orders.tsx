import Link from "next/link"
import { formatThb } from "@/lib/exchange-rate"
import { formatDate } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface OrderEntry {
  id: string
  orderNumber: string
  customerName: string
  status: string
  totalThbPrice: number
  createdAt: string
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

interface Props {
  orders: OrderEntry[]
}

export function RecentOrders({ orders }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Recent Orders</h3>
        <Link
          href="/orders"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {orders.slice(0, 5).map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-medium text-gray-900">
                {order.orderNumber}
              </p>
              <p className="truncate text-xs text-gray-500">{order.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatThb(Number(order.totalThbPrice))}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  statusColors[order.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {order.status}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Link>
        ))}
      </div>
    </div>
  )
}
