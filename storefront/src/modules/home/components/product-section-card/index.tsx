import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"

type VariantType = "Single" | "6-Pack"

export default function ProductSectionCard({
  product,
  variantType,
  region,
  showSavings,
}: {
  product: HttpTypes.StoreProduct
  variantType: VariantType
  region: HttpTypes.StoreRegion
  showSavings?: boolean
}) {
  const variants = (product.variants || []) as any[]
  const variant = variants.find(
    (v: any) => v.title?.toLowerCase() === variantType.toLowerCase()
  )

  if (!variant) return null

  const price = variant.calculated_price?.calculated_amount
  const originalPrice = variant.calculated_price?.original_amount
  const currency = variant.calculated_price?.currency_code

  const priceLabel =
    price != null && currency
      ? convertToLocale({ amount: price, currency_code: currency })
      : null

  // Show strikethrough if original price differs from calculated (sale pricing)
  const hasDiscount = originalPrice != null && price != null && originalPrice > price
  const originalPriceLabel =
    hasDiscount && currency
      ? convertToLocale({ amount: originalPrice, currency_code: currency })
      : null

  // Calculate per-unit savings for 6-packs
  let savingsNote: string | null = null
  if (showSavings && variantType === "6-Pack") {
    const singleVariant = variants.find(
      (v: any) => v.title?.toLowerCase() === "single"
    )
    if (singleVariant?.calculated_price?.calculated_amount && price && currency) {
      const singlePrice = singleVariant.calculated_price.calculated_amount
      const perUnitIn6Pack = price / 6
      const savingsPerUnit = singlePrice - perUnitIn6Pack
      if (savingsPerUnit > 0) {
        const savingsFormatted = convertToLocale({
          amount: Math.round(savingsPerUnit),
          currency_code: currency,
        })
        savingsNote = `Save ${savingsFormatted} per bottle`
      }
    }
  }

  return (
    <div className="bg-white rounded-large overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
      <LocalizedClientLink
        href={`/products/${product.handle}?v_id=${variant.id}`}
        className="block"
      >
        <div className="overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured
            priority
          />
        </div>
        <div className="px-4 pt-4 pb-2 flex-1">
          <h3 className="font-display text-lg font-semibold text-dark group-hover:text-primary transition-colors duration-200">
            {product.title}
          </h3>
          {priceLabel && (
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-nunito text-xl font-bold text-primary">
                {priceLabel}
              </p>
              {originalPriceLabel && (
                <p className="font-nunito text-sm text-dark/40 line-through">
                  {originalPriceLabel}
                </p>
              )}
            </div>
          )}
          {savingsNote && (
            <span className="inline-block mt-2 text-xs font-semibold text-white bg-accent px-3 py-1 rounded-full">
              {savingsNote}
            </span>
          )}
        </div>
      </LocalizedClientLink>
    </div>
  )
}
