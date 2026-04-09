import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

// Zero-decimal currencies (no smallest unit conversion needed)
const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
])

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  // Medusa stores amounts in smallest currency unit (cents/satang)
  // Divide by 100 for standard currencies, keep as-is for zero-decimal
  const divisor = ZERO_DECIMAL_CURRENCIES.has(currency_code.toLowerCase())
    ? 1
    : 100

  // Use Thai locale for THB to get ฿ symbol instead of "THB"
  const effectiveLocale = currency_code.toLowerCase() === "thb" ? "th-TH" : locale

  return new Intl.NumberFormat(effectiveLocale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minimumFractionDigits ?? 0,
    maximumFractionDigits: maximumFractionDigits ?? 0,
  }).format(amount / divisor)
}
