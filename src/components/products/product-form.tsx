"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

interface ProductFormData {
  name: string
  sku: string
  jpyCost: number
  thbPrice: number
  brand: string
  category: string
  otherShopPrice: number
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
      thbPrice: 0,
      brand: "",
      category: "",
      otherShopPrice: 0,
      description: "",
      stock: 0,
      imageUrl: "",
    }
  )

  // Brand autocomplete state
  const [existingBrands, setExistingBrands] = useState<string[]>([])
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false)
  const brandRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/products/brands")
      .then((res) => res.json())
      .then(setExistingBrands)
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setShowBrandSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const brandFilter = form.brand
    ? existingBrands.filter(
        (b) =>
          b.toLowerCase().includes(form.brand.toLowerCase()) &&
          b.toLowerCase() !== form.brand.toLowerCase()
      )
    : existingBrands

  const priceVsShopPrice =
    form.otherShopPrice > 0 && form.thbPrice > 0
      ? ((form.thbPrice - form.otherShopPrice) / form.otherShopPrice) * 100
      : null

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
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEditing ? "Update product details" : "Add a new product to your catalog"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., カルビー じゃがりこ"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>

          <div className="relative" ref={brandRef}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
            <input
              value={form.brand}
              onChange={(e) => {
                setForm({ ...form, brand: e.target.value })
                setShowBrandSuggestions(true)
              }}
              onFocus={() => setShowBrandSuggestions(true)}
              placeholder="e.g., Hadalabo"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
            {showBrandSuggestions && brandFilter.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                {brandFilter.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, brand })
                      setShowBrandSuggestions(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-indigo-50 dark:text-gray-300 dark:hover:bg-indigo-900/30"
                  >
                    <Check className="h-3.5 w-3.5 text-indigo-500" />
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">SKU *</label>
            <input
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g., SNK-001"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-900"
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cost (JPY) *
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.jpyCost || ""}
              onChange={(e) => setForm({ ...form, jpyCost: Number(e.target.value) })}
              placeholder="980"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price (THB) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
                ฿
              </span>
              <input
                required
                type="number"
                min="1"
                value={form.thbPrice || ""}
                onChange={(e) => setForm({ ...form, thbPrice: Number(e.target.value) })}
                placeholder="299"
                className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Other Shop Price (THB)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
                ฿
              </span>
              <input
                type="number"
                min="0"
                value={form.otherShopPrice || ""}
                onChange={(e) => setForm({ ...form, otherShopPrice: Number(e.target.value) })}
                placeholder="349"
                className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional description..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/product.jpg"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-900"
            />
          </div>
        </div>

        {form.thbPrice > 0 && form.otherShopPrice > 0 && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Our Price</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ฿{form.thbPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Other Shop</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ฿{form.otherShopPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  {priceVsShopPrice! >= 0 ? "Above Competitor" : "Below Competitor"}
                </p>
                <p
                  className={`text-lg font-bold ${
                    priceVsShopPrice! <= 0 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {priceVsShopPrice! >= 0 ? "+" : ""}
                  {priceVsShopPrice!.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/products"
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
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
