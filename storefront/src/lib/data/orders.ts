import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

export const retrieveOrder = cache(async function (id: string) {
  return sdk.store.order
    .retrieve(
      id,
      { fields: "+items, +customer, +payment_collections.payments, *items.variant.product" },
      { next: { tags: ["order"] } }
    )
    .then(({ order }) => order)
    .catch(() => null)
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) {
  return sdk.store.order
    .list(
      { limit, offset, fields: "+items, +customer, +payment_collections.payments", ...filters },
      { next: { tags: ["orders"] } }
    )
    .then(({ orders }) => orders)
    .catch(() => null)
})

export const createTransferRequest = async (
  currentState: Record<string, unknown>,
  formData: FormData
) => {
  const order_id = formData.get("order_id") as string

  try {
    await sdk.store.order.requestTransfer(order_id, {
      description: "Customer requested transfer",
    })
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.toString() }
  }
}

export const acceptTransferRequest = async (
  id: string,
  token: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    await sdk.store.order.acceptTransfer(id, { token })
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.toString() }
  }
}

export const declineTransferRequest = async (
  id: string,
  token: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    await sdk.store.order.declineTransfer(id, { token })
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.toString() }
  }
}
