import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import { convertToLocale } from "@lib/util/money"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  variant: variantProp,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  variant?: any
}) {
  const variants = (product.variants || []) as any[]
  const variant = variantProp ?? variants[0]

  const price = variant?.calculated_price?.calculated_amount
  const originalPrice = variant?.calculated_price?.original_amount
  const currency = variant?.calculated_price?.currency_code

  const priceLabel =
    price != null && currency
      ? convertToLocale({ amount: price, currency_code: currency })
      : null

  const hasDiscount =
    originalPrice != null && price != null && originalPrice > price
  const originalPriceLabel =
    hasDiscount && currency
      ? convertToLocale({ amount: originalPrice, currency_code: currency })
      : null

  const href = variantProp
    ? `/products/${product.handle}?v_id=${variant.id}`
    : `/products/${product.handle}`

  return (
    <div
      data-testid="product-wrapper"
      className="bg-white rounded-large overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col"
    >
      <LocalizedClientLink href={href} className="block flex-1">
        <div className="overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            priority={isFeatured}
          />
        </div>
        <div className="px-4 pt-4 pb-4">
          <Text
            className="font-display text-lg font-semibold text-dark group-hover:text-primary transition-colors duration-200"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          {variantProp && (
            <Text className="font-nunito text-xs text-dark/50 uppercase tracking-wider mt-1">
              {variant.title}
            </Text>
          )}
          {priceLabel && (
            <div className="mt-2 flex items-baseline gap-2">
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
        </div>
      </LocalizedClientLink>
    </div>
  )
}
