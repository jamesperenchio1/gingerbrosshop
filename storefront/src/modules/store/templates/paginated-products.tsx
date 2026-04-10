import { HttpTypes } from "@medusajs/types"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  // Split products into per-variant cards, grouped by Singles and 6-Packs.
  const singlePairs = products.flatMap((p) => {
    const v = ((p.variants || []) as any[]).find(
      (v: any) => v.title?.toLowerCase() === "single"
    )
    return v ? [{ product: p, variant: v }] : []
  })
  const sixPackPairs = products.flatMap((p) => {
    const v = ((p.variants || []) as any[]).find(
      (v: any) => v.title?.toLowerCase() === "6-pack"
    )
    return v ? [{ product: p, variant: v }] : []
  })
  // Catch-all for any product with variants that aren't single or 6-pack
  const otherPairs = products.flatMap((p) => {
    return ((p.variants || []) as any[])
      .filter(
        (v: any) =>
          v.title?.toLowerCase() !== "single" &&
          v.title?.toLowerCase() !== "6-pack"
      )
      .map((v) => ({ product: p, variant: v }))
  })

  const renderGrid = (
    pairs: { product: HttpTypes.StoreProduct; variant: any }[]
  ) => (
    <ul
      className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
      data-testid="products-list"
    >
      {pairs.map(({ product, variant }) => (
        <li key={`${product.id}-${variant.id}`}>
          <ProductPreview
            product={product}
            region={region}
            variant={variant}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <div className="flex flex-col gap-y-16">
        {singlePairs.length > 0 && (
          <section>
            <div className="mb-8">
              <p className="text-primary font-nunito font-semibold tracking-[0.2em] uppercase text-xs mb-2">
                Try Our Flavors
              </p>
              <h2 className="font-display text-2xl small:text-3xl font-bold text-dark">
                Singles
              </h2>
              <p className="font-nunito text-dark/60 mt-1 text-sm">
                Perfect for trying something new.
              </p>
            </div>
            {renderGrid(singlePairs)}
          </section>
        )}

        {sixPackPairs.length > 0 && (
          <section>
            <div className="mb-8">
              <p className="text-accent font-nunito font-semibold tracking-[0.2em] uppercase text-xs mb-2">
                Better Value
              </p>
              <h2 className="font-display text-2xl small:text-3xl font-bold text-dark">
                6-Packs
              </h2>
              <p className="font-nunito text-dark/60 mt-1 text-sm">
                Stock up and save on your favorites.
              </p>
            </div>
            {renderGrid(sixPackPairs)}
          </section>
        )}

        {otherPairs.length > 0 && (
          <section>{renderGrid(otherPairs)}</section>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
