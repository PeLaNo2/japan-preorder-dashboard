"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import { formatJpy, formatThb } from "@/lib/exchange-rate"
import { formatDate, formatDateTime } from "@/lib/utils"

interface OrderItem {
  id: string
  quantity: number
  unitJpyCost: number
  unitJpyPrice: number
  totalJpyCost: number
  totalJpyPrice: number
  profitJpy: number
  unitThbCost: number
  unitThbPrice: number
  totalThbCost: number
  totalThbPrice: number
  profitThb: number
  product: { name: string; sku: string; imageUrl: string | null; category: string | null }
}

interface ExchangeRate {
  jpyToThb: number
  source: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  status: string
  notes: string | null
  totalJpyCost: number
  totalJpyPrice: number
  totalProfitJpy: number
  totalThbCost: number
  totalThbPrice: number
  totalProfitThb: number
  createdAt: string
  items: OrderItem[]
  createdBy: { name: string; email: string | null }
  exchangeRate: ExchangeRate | null
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
  DELIVERED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  CANCELLED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
}

const statusTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}

interface Props {
  order: Order
}

export function OrderDetail({ order }: Props) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(order.status)

  async function updateStatus(newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to update status")
        return
      }
      setCurrentStatus(newStatus)
      toast.success(`Order marked as ${newStatus}`)
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/orders"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-gray-900 dark:text-gray-100">{order.orderNumber}</h1>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-medium ${
                statusColors[currentStatus] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {currentStatus}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Created {formatDateTime(order.createdAt)}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      {/* Status Actions */}
      {statusTransitions[currentStatus]?.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {statusTransitions[currentStatus].map((nextStatus) => {
            const colors: Record<string, string> = {
              CONFIRMED: "bg-blue-600 hover:bg-blue-700",
              SHIPPED: "bg-purple-600 hover:bg-purple-700",
              DELIVERED: "bg-green-600 hover:bg-green-700",
              CANCELLED: "bg-red-500 hover:bg-red-600",
            }
            return (
              <button
                key={nextStatus}
                onClick={() => updateStatus(nextStatus)}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-all ${colors[nextStatus] ?? "bg-gray-600 hover:bg-gray-700"}`}
              >
                Mark as {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</h2>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customerName}</p>
          {order.customerEmail && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerEmail}</p>
          )}
          {order.customerPhone && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerPhone}</p>
          )}
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">by {order.createdBy.name}</p>
        </div>

        {/* Exchange Rate */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Exchange Rate</h2>
          {order.exchangeRate ? (
            <>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                1 JPY = {Number(order.exchangeRate.jpyToThb).toFixed(6)} THB
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {order.exchangeRate.source}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDateTime(order.exchangeRate.createdAt)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Not recorded</p>
          )}
        </div>

        {/* Totals */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Order Totals</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Revenue (JPY)</span>
              <span className="font-medium dark:text-gray-100">{formatJpy(Number(order.totalJpyPrice))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Revenue (THB)</span>
              <span className="font-medium dark:text-gray-100">{formatThb(Number(order.totalThbPrice))}</span>
            </div>
            <div className="border-t border-gray-100 pt-1.5 flex justify-between dark:border-gray-700">
              <span className="font-medium text-green-700 dark:text-green-400">Profit (JPY)</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatJpy(Number(order.totalProfitJpy))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-green-700 dark:text-green-400">Profit (THB)</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatThb(Number(order.totalProfitThb))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Items</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Product</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Cost (JPY)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Price (JPY)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Profit (JPY)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Profit (THB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.product.sku}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center text-sm text-gray-700 dark:text-gray-300">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-gray-600 dark:text-gray-400">
                    {formatJpy(Number(item.unitJpyCost))}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatJpy(Number(item.unitJpyPrice))}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-medium text-green-600 dark:text-green-400">
                    {formatJpy(Number(item.profitJpy))}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-green-600 dark:text-green-400">
                    {formatThb(Number(item.profitThb))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50/80 font-medium dark:border-gray-700 dark:bg-gray-900/80">
                <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300" colSpan={2}>
                  {order.items.reduce((s, i) => s + i.quantity, 0)} units total
                </td>
                <td className="px-4 py-3.5 text-right text-sm text-gray-700 dark:text-gray-300">
                  {formatJpy(Number(order.totalJpyCost))}
                </td>
                <td className="px-4 py-3.5 text-right text-sm text-gray-900 dark:text-gray-100">
                  {formatJpy(Number(order.totalJpyPrice))}
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-bold text-green-600 dark:text-green-400">
                  {formatJpy(Number(order.totalProfitJpy))}
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-bold text-green-600 dark:text-green-400">
                  {formatThb(Number(order.totalProfitThb))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile items */}
        <div className="space-y-2 md:hidden">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">×{item.quantity}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 dark:text-gray-500">Price</p>
                  <p className="font-medium dark:text-gray-100">{formatJpy(Number(item.unitJpyPrice))}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500">Profit (JPY)</p>
                  <p className="font-medium text-green-600 dark:text-green-400">{formatJpy(Number(item.profitJpy))}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500">Profit (THB)</p>
                  <p className="font-medium text-green-600 dark:text-green-400">{formatThb(Number(item.profitThb))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
