"use client"

import Link from "next/link"
import { Plus, Eye } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { formatJpy, formatThb } from "@/lib/exchange-rate"
import { formatDate } from "@/lib/utils"

interface OrderItem {
  product: { name: string; sku: string }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  status: string
  totalJpyPrice: number
  totalThbPrice: number
  totalProfitThb: number
  createdAt: string
  items: OrderItem[]
  createdBy: { name: string }
}

interface Props {
  orders: Order[]
  statusFilter: string
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
  DELIVERED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  CANCELLED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
}

export function OrderTable({ orders, statusFilter }: Props) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title={statusFilter ? "No orders with this status" : "No orders yet"}
        description={
          statusFilter
            ? `No orders with status "${statusFilter}"`
            : "Create your first order to start tracking sales."
        }
        action={
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        }
      />
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Order #
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Customer
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Items
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total (THB)
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Profit
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customerName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">by {order.createdBy.name}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </td>
                <td className="px-5 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatThb(Number(order.totalThbPrice))}
                </td>
                <td className="px-5 py-4 text-right text-sm">
                  <span
                    className={
                      Number(order.totalProfitThb) >= 0 ? "text-green-600 font-medium dark:text-green-400" : "text-red-500"
                    }
                  >
                    {formatThb(Number(order.totalProfitThb))}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${
                      statusStyles[order.status] ?? "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-sm text-gray-400 dark:text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">{order.orderNumber}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerName}</p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  statusStyles[order.status] ?? "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {order.items.length} item{order.items.length > 1 ? "s" : ""}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatThb(Number(order.totalThbPrice))}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>by {order.createdBy.name}</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
