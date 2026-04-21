import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

export const listCategories = cache(async function (
  query?: HttpTypes.StoreProductCategoryListParams
) {
  return sdk.store.category
    .list(
      { limit: 100, ...query },
      { next: { tags: ["categories"] } }
    )
    .then(({ product_categories }) => product_categories)
    .catch(() => null)
})

export const getCategoryByHandle = cache(async function (handle: string[]) {
  return sdk.store.category
    .list(
      { handle: handle.join("/"), limit: 1 },
      { next: { tags: ["categories"] } }
    )
    .then(({ product_categories }) => product_categories[0] ?? null)
    .catch(() => null)
})
