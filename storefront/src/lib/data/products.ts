import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

export const listProducts = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}) {
  const limit = queryParams?.limit ?? 12
  const offset = ((pageParam ?? 1) - 1) * limit

  const { products, count } = await sdk.store.product.list(
    {
      limit,
      offset,
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,+metadata",
      ...queryParams,
    },
    { next: { tags: ["products"] } }
  )

  return {
    response: { products, count },
    nextPage: count > offset + limit ? pageParam + 1 : null,
    queryParams,
  }
})

export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  const { products } = await sdk.store.product.list(
    {
      handle,
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,+metadata",
    },
    { next: { tags: ["products"] } }
  )

  return products[0] ?? null
})

export const getProductById = cache(async function (
  id: string,
  regionId: string
) {
  return sdk.store.product
    .retrieve(
      id,
      {
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+metadata",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ product }) => product)
    .catch(() => null)
})

export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields: "*variants.calculated_price",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
    .catch(() => null)
})

export const listProductsWithSort = cache(async function ({
  page = 0,
  queryParams,
  sortBy,
  countryCode,
  regionId,
}: {
  page?: number
  queryParams?: HttpTypes.StoreProductListParams
  sortBy?: string
  countryCode?: string
  regionId?: string
}) {
  const limit = queryParams?.limit ?? 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: page + 1,
    queryParams: {
      ...queryParams,
      limit,
    },
    countryCode,
    regionId,
  })

  return {
    response: {
      products,
      count,
    },
    nextPage: count > page * limit + limit ? page + 1 : null,
    queryParams,
  }
})
