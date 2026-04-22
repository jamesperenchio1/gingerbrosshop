"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { transferCart } from "./cart"

export const retrieveCustomer = async () => {
  return sdk.store.customer
    .retrieve({})
    .then(({ customer }) => customer)
    .catch(() => null)
}

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const updateRes = await sdk.store.customer
    .update(body, {})
    .catch(medusaError)

  const customer = updateRes.customer

  revalidateTag("customer")
  return customer
}

type SignupInput = HttpTypes.StoreCreateCustomer & { password: string }

export const signup = async (currentState: unknown, formData: FormData) => {
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: customerForm.password,
    })

    const customHeaders = { authorization: `Bearer ${token}` }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      {
        email: customerForm.email,
        first_name: customerForm.first_name,
        last_name: customerForm.last_name,
        phone: customerForm.phone,
      },
      {},
      customHeaders
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password: customerForm.password,
    })

    revalidateTag("auth")
    revalidateTag("customer")

    await transferCart().catch(() => null)

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export const login = async (currentState: unknown, formData: FormData) => {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth.login("customer", "emailpass", { email, password })
  } catch (error: any) {
    return error.toString()
  }

  revalidateTag("auth")
  revalidateTag("customer")

  await transferCart().catch(() => null)
}

export const signout = async (countryCode: string) => {
  await sdk.auth.logout()
  revalidateTag("auth")
  revalidateTag("customer")
  redirect(`/${countryCode}/account`)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: currentState.isDefaultBilling === true,
    is_default_shipping: currentState.isDefaultShipping === true,
  }

  return sdk.store.customer
    .createAddress(address, {})
    .then(({ customer }) => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId = currentState.addressId as string

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {})
    .then(({ customer }) => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (addressId: string): Promise<void> => {
  await sdk.store.customer.deleteAddress(addressId).catch(medusaError)
  revalidateTag("customer")
}
