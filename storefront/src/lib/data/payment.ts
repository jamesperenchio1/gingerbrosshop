import { sdk } from "@lib/config"
import { cache } from "react"

export const listCartPaymentMethods = cache(async function (regionId: string) {
  return sdk.store.payment
    .listPaymentProviders({ region_id: regionId })
    .then(({ payment_providers }) => payment_providers)
    .catch(() => null)
})
