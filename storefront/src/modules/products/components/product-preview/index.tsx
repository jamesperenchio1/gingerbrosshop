import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import { convertToLocale } from "@lib/util/money"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const variants = (product.variants || []) as any[]

  return (
    <div
      data-testid="product-wrapper"
      className="bg-white rounded-large overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block"
      >
        <div className="overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            priority={isFeatured}
          />
        </div>
        <div className="px-4 pt-4 pb-2">
          <Text
            className="font-display text-lg font-semibold text-dark group-hover:text-primary transition-colors duration-200"
            data-testid="product-title"
          >
            {product.title}
          </Text>
        </div>
      </LocalizedClientLink>

      {variants.length > 1 && (
        <div className="px-4 pb-4 flex gap-2">
          {variants.map((variant: any) => {
            const price = variant.calculated_price?.calculated_amount
            const currency = variant.calculated_price?.currency_code
            const priceLabel =
              price != null && currency
                ? convertToLocale({ amount: price, currency_code: currency })
                : ""

            return (
              <LocalizedClientLink
                key={variant.id}
                href={`/products/${product.handle}?v_id=${variant.id}`}
                className="flex-1 text-center py-2 px-3 rounded-rounded border border-primary/30 text-sm font-medium text-dark hover:bg-primary hover:text-white transition-colors duration-200"
              >
                <span className="block font-semibold">{variant.title}</span>
                {priceLabel && (
                  <span className="block text-xs mt-0.5 opacity-80">
                    {priceLabel}
                  </span>
                )}
              </LocalizedClientLink>
            )
          })}
        </div>
      )}

      {variants.length <= 1 && (
        <div className="px-4 pb-4">
          {variants[0]?.calculated_price && (
            <Text className="text-ui-fg-muted text-sm">
              {convertToLocale({
                amount: variants[0].calculated_price.calculated_amount,
                currency_code: variants[0].calculated_price.currency_code,
              })}
            </Text>
          )}
        </div>
      )}
    </div>
  )
}
