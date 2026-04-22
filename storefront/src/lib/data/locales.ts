import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

export const listLocales = cache(async function () {
  return sdk.store.locale
    .list()
    .then(({ locales }) => locales)
    .catch(() => null)
})

export type Locale = HttpTypes.StoreLocale
