"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Search, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Product } from "@prisma/client"
import { formatJpy, formatThb } from "@/lib/exchange-rate"

interface OrderItemEntry {
  product: Product
  quantity: number
}

export function OrderForm() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState<OrderItemEntry[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showProductPicker, setShowProductPicker] = useState(false)

  useEffect(() => {
    fetch("/api/products?active=true")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  )

  function addItem() {
    if (!selectedProduct || quantity < 1) return
    const existing = items.find((i) => i.product.id === selectedProduct.id)
    if (existing) {
      setItems(
        items.map((i) =>
          i.product.id === selectedProduct.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      )
    } else {
      setItems([...items, { product: selectedProduct, quantity }])
    }
    setSelectedProduct(null)
    setQuantity(1)
    setSearch("")
    setShowProductPicker(false)
  }

  function removeItem(productId: string) {
    setItems(items.filter((i) => i.product.id !== productId))
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty < 1) return
    setItems(items.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)))
  }

  const totals = items.reduce(
    (acc, item) => {
      const cost = Number(item.product.jpyCost) * item.quantity
      const price = Number(item.product.thbPrice) * item.quantity
      return {
        jpyCost: acc.jpyCost + cost,
        thbPrice: acc.thbPrice + price,
      }
    },
    { jpyCost: 0, thbPrice: 0 }
  )

  // We don't have the exchange rate client-side, so show THB only and let the server calculate JPY/THB totals
  // The server will return the full values after creation

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName) {
      toast.error("Customer name is required")
      return
    }
    if (items.length === 0) {
      toast.error("Add at least one item")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || undefined,
          customerPhone: customerPhone || undefined,
          notes: notes || undefined,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to create order")
        return
      }

      const order = await res.json()
      toast.success(`Order ${order.orderNumber} created`)
      router.push(`/orders/${order.id}`)
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Order</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a new customer order</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer Information</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@email.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>
        </div>
      </div>

      {/* Add Items */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Add Items</h2>

        {!showProductPicker ? (
          <button
            type="button"
            onClick={() => setShowProductPicker(true)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-5 py-3 text-sm font-medium text-gray-500 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Add Product to Order
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
              />
            </div>

            {search && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400 dark:text-gray-500">No products found</p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p)
                        setSearch(p.name)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedProduct?.id === p.id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                      <span className="ml-2 text-gray-400 dark:text-gray-500">{p.sku}</span>
                      <span className="ml-auto float-right font-medium text-gray-700 dark:text-gray-300">
                        {formatThb(Number(p.thbPrice))}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedProduct && (
              <div className="flex items-end gap-3 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/30">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedProduct.sku} — {formatThb(Number(selectedProduct.thbPrice))} each</p>
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Qty</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null)
                    setSearch("")
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Item List */}
        {items.length > 0 && (
          <div className="mt-4 space-y-2">
            {items.map((item) => {
              const lineCost = Number(item.product.jpyCost) * item.quantity
              const linePrice = Number(item.product.thbPrice) * item.quantity

              return (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.product.sku}</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatJpy(linePrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Notes (Optional)</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any additional notes..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
        />
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal (THB)</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatThb(totals.thbPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Cost (JPY)</span>
              <span className="text-gray-700 dark:text-gray-300">{formatJpy(totals.jpyCost)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300">Estimated Profit (JPY)</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 pt-1 dark:text-gray-500">
              <span>THB values calculated on server with live exchange rate</span>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link
          href="/orders"
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Order"
          )}
        </button>
      </div>
    </form>
  )
}
