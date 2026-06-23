import { formatJpy } from "@/lib/exchange-rate"
import { Package } from "lucide-react"

interface ProductEntry {
  name: string
  sku: string
  salesCount: number
  profitJpy: number
}

interface Props {
  products: ProductEntry[]
}

export function TopProducts({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Top Selling Products</h3>
        <div className="flex flex-col items-center py-8 text-center text-sm text-gray-400">
          <Package className="mb-2 h-8 w-8" />
          <p>No sales data yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Top Selling Products</h3>
      <div className="space-y-3">
        {products.slice(0, 5).map((product, i) => (
          <div key={product.sku} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-400">{product.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{product.salesCount} sold</p>
              <p className="text-xs text-green-600">{formatJpy(product.profitJpy)} profit</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
