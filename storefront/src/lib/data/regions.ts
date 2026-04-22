import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

export const listRegions = cache(async function () {
  return sdk.store.region
    .list({})
    .then(({ regions }) => regions)
    .catch(() => null)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {})
    .then(({ region }) => region)
    .catch(() => null)
})

export const getRegion = cache(async function (countryCode: string) {
  const regions = await listRegions()
  if (!regions) return null

  return (
    regions.find((region) =>
      region.countries?.some((c) => c.iso_2 === countryCode)
    ) ?? null
  )
})
