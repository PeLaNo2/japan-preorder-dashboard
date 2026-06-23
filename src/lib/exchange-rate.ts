const API_URL = "https://api.exchangerate-api.com/v4/latest/JPY"

export async function fetchJpyToThbRate(): Promise<number> {
  const res = await fetch(API_URL, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Exchange rate API returned ${res.status}`)
  const data = await res.json()
  const rate = data.rates.THB as number
  if (!rate) throw new Error("THB rate not found in response")
  return rate
}

export function formatJpy(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatThb(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
