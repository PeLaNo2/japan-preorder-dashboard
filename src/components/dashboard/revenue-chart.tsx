"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface DataPoint {
  date: string
  revenueThb: number
  profitThb: number
  orders: number
}

interface Props {
  data: DataPoint[]
}

export function RevenueChart({ data }: Props) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark"))

  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }))

  const gridColor = isDark ? "#1f2937" : "#f0f0f0"
  const textColor = isDark ? "#6b7280" : "#9ca3af"
  const tooltipStyle = {
    borderRadius: "12px",
    border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
    background: isDark ? "#1f2937" : "#fff",
    color: isDark ? "#e5e7eb" : "#111827",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue & Profit (30 Days)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: textColor }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: textColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`฿${value.toLocaleString()}`, undefined]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenueThb"
              name="Revenue (THB)"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profitThb"
              name="Profit (THB)"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
