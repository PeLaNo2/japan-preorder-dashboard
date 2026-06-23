"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProductFormData {
  name: string
  sku: string
  jpyCost: number
  jpyPrice: number
  category: string
  description: string
  stock: number
  imageUrl: string
}

interface Props {
  initialData?: ProductFormData & { id?: string }
}

const categories = ["SNACKS", "SKINCARE", "STATIONERY", "DRINKS", "OTHER"]

export function ProductForm({ initialData }: Props) {
  const router = useRouter()
  const isEditing = !!initialData?.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProductFormData>(
    initialData ?? {
      name: "",
      sku: "",
      jpyCost: 0,
      jpyPrice: 0,
      category: "",
      description: "",
      stock: 0,
      imageUrl: "",
    }
  )

  const margin =
    form.jpyPrice > 0 ? ((form.jpyPrice - form.jpyCost) / form.jpyPrice) * 100 : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const url = isEditing ? `/api/products/${initialData!.id}` : "/api/products"
    const method = isEditing ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to save product")
        return
      }

      toast.success(isEditing ? "Product updated" : "Product created")
      router.push("/products")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditing ? "Update product details" : "Add a new product to your catalog"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., カルビー じゃがりこ"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU *</label>
            <input
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g., SNK-001"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Cost (JPY) *
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.jpyCost || ""}
              onChange={(e) => setForm({ ...form, jpyCost: Number(e.target.value) })}
              placeholder="980"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price (JPY) *
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.jpyPrice || ""}
              onChange={(e) => setForm({ ...form, jpyPrice: Number(e.target.value) })}
              placeholder="1580"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional description..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/product.jpg"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {form.jpyCost > 0 && form.jpyPrice > 0 && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-500">Margin</p>
                <p className={`text-lg font-bold ${margin >= 20 ? "text-green-600" : "text-amber-600"}`}>
                  {margin.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-500">Profit (JPY)</p>
                <p className="text-lg font-bold text-gray-900">
                  ¥{(form.jpyPrice - form.jpyCost).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Cost Ratio</p>
                <p className="text-lg font-bold text-gray-900">
                  {((form.jpyCost / form.jpyPrice) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/products"
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : isEditing ? "Update Product" : "Save Product"}
        </button>
      </div>
    </form>
  )
}
