import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "@lib/data/regions"

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

  let resolvedRegionId = regionId
  if (!resolvedRegionId && countryCode) {
    const region = await getRegion(countryCode)
    resolvedRegionId = region?.id
  }

  if (!resolvedRegionId) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    }
  }

  const { products, count } = await sdk.store.product.list({
    limit,
    offset,
    region_id: resolvedRegionId,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,*images,*options,*options.values,*variants.options,*variants.images",
    ...queryParams,
  })

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
  const { products } = await sdk.store.product.list({
    handle,
    region_id: regionId,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,*images,*options,*options.values,*variants.options,*variants.images",
  })

  return products[0] ?? null
})

export const getProductById = cache(async function (
  id: string,
  regionId: string
) {
  return sdk.store.product
    .retrieve(id, {
      region_id: regionId,
      fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,*images,*options,*options.values,*variants.options,*variants.images",
    })
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
    .list({
      id: ids,
      region_id: regionId,
      fields: "*variants.calculated_price",
    })
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
    queryParams: { ...queryParams, limit },
    countryCode,
    regionId,
  })

  return {
    response: { products, count },
    nextPage: count > page * limit + limit ? page + 1 : null,
    queryParams,
  }
})
