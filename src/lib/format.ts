import { CURRENCY_SYMBOL } from "@/constants/store"

/** Formats a minor-unit amount (satang) as a Baht string, e.g. 14000 -> "฿140". */
export function formatCurrency(amountInMinorUnits: number | null | undefined): string {
  return `${CURRENCY_SYMBOL}${((amountInMinorUnits ?? 0) / 100).toLocaleString()}`
}

/** Formats an order date the way order history/tracking pages display it, e.g. "3 Jan 2026". */
export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
