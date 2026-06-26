"use client"

import Link from "next/link"
import { Pencil, Plus } from "lucide-react"
import { type Product } from "@prisma/client"
import { ThbDisplay } from "@/components/shared/currency-display"
import { EmptyState } from "@/components/shared/empty-state"

interface Props {
  products: Product[]
  search: string
}

export function ProductTable({ products, search }: Props) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Pencil className="h-8 w-8" />}
        title={search ? "No products found" : "No products yet"}
        description={
          search
            ? `No products matching "${search}"`
            : "Add your first product to start tracking sales and profits."
        }
        action={
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
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
                Product
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Brand
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                SKU
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Cost (JPY)
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Price (THB)
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Sold
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Stock
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.map((product) => {
              const cost = Number(product.jpyCost)
              const price = Number(product.thbPrice)
              return (
                <tr key={product.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {product.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <div className="flex items-center gap-2">
                          {product.brand && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</span>
                          )}
                          {product.category && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {product.brand ? "·" : ""} {product.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {product.brand || "-"}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{product.sku}</td>
                  <td className="px-5 py-4 text-right text-sm">
                    ¥{cost.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-medium">
                    <ThbDisplay amount={price} />
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                    {product.salesCount}
                  </td>
                  <td className="px-5 py-4 text-right text-sm">
                    <span
                      className={
                        product.stock > 0 ? "text-gray-900 dark:text-gray-100" : "text-red-500"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card grid */}
      <div className="grid gap-3 md:hidden">
        {products.map((product) => {
          const cost = Number(product.jpyCost)
          const price = Number(product.thbPrice)
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99] dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {product.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{product.sku}</p>
                  {product.brand && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">{product.brand}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Cost: ¥{cost.toLocaleString()}
                </span>
                <span className="font-medium dark:text-gray-100">
                  Price: <ThbDisplay amount={price} />
                </span>
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>Sold: {product.salesCount}</span>
                <span>Stock: {product.stock}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
