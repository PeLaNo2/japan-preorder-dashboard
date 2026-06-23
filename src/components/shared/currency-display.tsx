import { formatJpy, formatThb } from "@/lib/exchange-rate"

export function JpyDisplay({ amount }: { amount: number }) {
  return <span className="tabular-nums">{formatJpy(amount)}</span>
}

export function ThbDisplay({ amount }: { amount: number }) {
  return <span className="tabular-nums text-gray-700">{formatThb(amount)}</span>
}

export function CurrencyPair({ jpy, thb }: { jpy: number; thb: number }) {
  return (
    <span className="tabular-nums">
      <span className="font-medium">{formatJpy(jpy)}</span>
      <span className="mx-1 text-gray-300">/</span>
      <span className="text-gray-500">{formatThb(thb)}</span>
    </span>
  )
}
