import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <div className="w-full flex flex-col divide-y divide-gray-100">
      <div className="pb-8">
        <Addresses cart={cart} customer={customer} />
      </div>
      <div className="py-8">
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      </div>
      <div className="py-8">
        <Payment cart={cart} availablePaymentMethods={paymentMethods} />
      </div>
      <div className="pt-8">
        <Review cart={cart} />
      </div>
    </div>
  )
}
