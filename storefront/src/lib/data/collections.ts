import { sdk } from "@lib/config"
import { cache } from "react"

export const listCollections = cache(async function (
  queryParams?: Record<string, string>
) {
  return sdk.store.collection
    .list({ limit: 100, ...queryParams })
    .then(({ collections }) => ({ collections }))
    .catch(() => ({ collections: [] }))
})

export const getCollectionByHandle = cache(async function (handle: string) {
  return sdk.store.collection
    .list({ handle, limit: 1 })
    .then(({ collections }) => collections[0] ?? null)
    .catch(() => null)
})
