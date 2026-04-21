import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

export const listCollections = cache(async function (
  queryParams?: Record<string, string>
) {
  return sdk.store.collection
    .list(
      { limit: 100, ...queryParams },
      { next: { tags: ["collections"] } }
    )
    .then(({ collections }) => ({ collections }))
    .catch(() => ({ collections: [] }))
})

export const getCollectionByHandle = cache(async function (handle: string) {
  return sdk.store.collection
    .list(
      { handle, limit: 1 },
      { next: { tags: ["collections"] } }
    )
    .then(({ collections }) => collections[0] ?? null)
    .catch(() => null)
})
