import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const isMadeToOrder = product.handle === "unpasteurized-ginger-beer"

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {isMadeToOrder && (
          <div
            className="inline-flex items-center gap-x-2 self-start rounded-full bg-[#FDF6EC] border border-[#C8702A]/30 px-4 py-2 text-sm font-medium text-[#A85C20]"
            data-testid="made-to-order-badge"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#C8702A]" />
            Brewed to order &middot; Ships within 5&ndash;7 days
          </div>
        )}

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
