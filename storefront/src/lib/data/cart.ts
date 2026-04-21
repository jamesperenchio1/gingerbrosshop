"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getRegion } from "./regions"

const getCartId = async () => {
  const cookieStore = await cookies()
  return cookieStore.get("_medusa_cart_id")?.value
}

const setCartId = async (cartId: string) => {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

const removeCartId = async () => {
  const cookieStore = await cookies()
  cookieStore.delete("_medusa_cart_id")
}

export const retrieveCart = async () => {
  const cartId = await getCartId()
  if (!cartId) return null

  return sdk.store.cart
    .retrieve(cartId, {
      fields:
        "+items, +region, +items.product.*, +items.variant.*, +items.thumbnail, +items.metadata, *items.variant.product.variants",
    })
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })
}

export const getOrSetCart = async (countryCode: string) => {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  if (!cart) {
    const cartResp = await sdk.store.cart.create({ region_id: region.id })
    cart = cartResp.cart
    await setCartId(cart.id)
    revalidateTag("cart")
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id })
    revalidateTag("cart")
  }

  return cart
}

export const updateCart = async (data: HttpTypes.StoreUpdateCart) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No existing cart found, please create one before updating")

  const { cart } = await sdk.store.cart.update(cartId, data).catch(medusaError)
  revalidateTag("cart")
  return cart
}

export const addToCart = async ({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) => {
  if (!variantId) throw new Error("Missing variant ID when adding to cart")

  const cart = await getOrSetCart(countryCode)
  if (!cart) throw new Error("Error retrieving or creating cart")

  await sdk.store.cart
    .createLineItem(cart.id, {
      variant_id: variantId,
      quantity,
    })
    .catch(medusaError)

  revalidateTag("cart")
}

export const updateLineItem = async ({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when updating line item")

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity })
    .catch(medusaError)

  revalidateTag("cart")
}

export const deleteLineItem = async (lineId: string) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when deleting line item")

  await sdk.store.cart.deleteLineItem(cartId, lineId).catch(medusaError)

  revalidateTag("cart")
}

export const setAddresses = async (currentState: unknown, formData: FormData) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when setting addresses")

  const data = {
    shipping_address: {
      first_name: formData.get("shipping_address.first_name"),
      last_name: formData.get("shipping_address.last_name"),
      address_1: formData.get("shipping_address.address_1"),
      address_2: formData.get("shipping_address.address_2"),
      company: formData.get("shipping_address.company"),
      postal_code: formData.get("shipping_address.postal_code"),
      city: formData.get("shipping_address.city"),
      country_code: formData.get("shipping_address.country_code"),
      province: formData.get("shipping_address.province"),
      phone: formData.get("shipping_address.phone"),
    } as HttpTypes.StoreCartAddress,
    email: formData.get("email") as string,
  } as HttpTypes.StoreUpdateCart

  const sameAsShipping = formData.get("same_as_shipping")
  if (sameAsShipping === "on") {
    data.billing_address = data.shipping_address
  } else {
    data.billing_address = {
      first_name: formData.get("billing_address.first_name"),
      last_name: formData.get("billing_address.last_name"),
      address_1: formData.get("billing_address.address_1"),
      address_2: formData.get("billing_address.address_2"),
      company: formData.get("billing_address.company"),
      postal_code: formData.get("billing_address.postal_code"),
      city: formData.get("billing_address.city"),
      country_code: formData.get("billing_address.country_code"),
      province: formData.get("billing_address.province"),
      phone: formData.get("billing_address.phone"),
    } as HttpTypes.StoreCartAddress
  }

  await sdk.store.cart.update(cartId, data).catch(medusaError)
  revalidateTag("cart")
}

export const listCartOptions = async () => {
  const cartId = await getCartId()
  if (!cartId) return { shipping_options: [] }

  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId })
    .catch(medusaError)
}

export const setShippingMethod = async ({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) => {
  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId })
    .catch(medusaError)
    .then(() => {
      revalidateTag("cart")
    })
}

export const initiatePaymentSession = async (
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    data?: Record<string, unknown>
  }
) => {
  return sdk.store.payment
    .initiatePaymentSession(cart, {
      provider_id: data.provider_id,
      data: data.data,
    })
    .then((resp) => {
      revalidateTag("cart")
      return resp
    })
    .catch(medusaError)
}

export const applyPromotions = async (codes: string[]) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when applying promotions")

  await sdk.store.cart
    .update(cartId, { promo_codes: codes } as any)
    .catch(medusaError)

  revalidateTag("cart")
}

export const applyGiftCard = async (code: string) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when applying gift card")

  await sdk.store.cart
    .update(cartId, { gift_cards: [{ code }] } as any)
    .catch(medusaError)

  revalidateTag("cart")
}

export const removeDiscount = async (code: string) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when removing discount")

  revalidateTag("cart")
}

export const removeGiftCard = async (
  codeToRemove: string,
  giftCards: { code: string }[]
) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when removing gift card")

  await sdk.store.cart
    .update(cartId, {
      gift_cards: giftCards
        .filter((gc) => gc.code !== codeToRemove)
        .map((gc) => ({ code: gc.code })),
    } as any)
    .catch(medusaError)

  revalidateTag("cart")
}

export const submitDiscountForm = async (
  currentState: unknown,
  formData: FormData
) => {
  const code = formData.get("code") as string
  await applyPromotions([code]).catch(medusaError)
}

export const placeOrder = async (cartId?: string) => {
  const id = cartId || (await getCartId())
  if (!id) throw new Error("Missing cart ID when placing order")

  const cartRes = await sdk.store.cart.complete(id).catch(medusaError)

  revalidateTag("cart")

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()
    await removeCartId()
    redirect(`/${countryCode}/order/confirmed/${cartRes?.order.id}`)
  }

  return cartRes
}

export const updateRegion = async (countryCode: string, currentPath: string) => {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await sdk.store.cart.update(cartId, { region_id: region.id })
    revalidateTag("cart")
  }

  redirect(`/${countryCode}${currentPath}`)
}

export const transferCart = async () => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when transferring cart")

  await sdk.store.cart.transferCart(cartId).catch(medusaError)
  revalidateTag("cart")
}

export const listCartShippingMethods = async (cartId: string) => {
  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => null)
}

export const listCartPaymentMethods = async (regionId: string) => {
  return sdk.store.payment
    .listPaymentProviders({ region_id: regionId })
    .then(({ payment_providers }) => payment_providers)
    .catch(() => null)
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  return sdk.store.fulfillment
    .calculate(optionId, { cart_id: cartId, data } as any)
    .then(({ shipping_option }) => shipping_option)
    .catch(() => null)
}
