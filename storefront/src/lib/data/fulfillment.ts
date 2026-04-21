import { sdk } from "@lib/config"
import { cache } from "react"

export const calculatePriceForShippingOption = cache(async function (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) {
  return sdk.store.fulfillment
    .calculate(optionId, { cart_id: cartId, data } as any)
    .then(({ shipping_option }) => shipping_option)
    .catch(() => null)
})

export const listCartShippingMethods = async (cartId: string) => {
  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => null)
}
