"use client"

import { isManual, isStripeCard, isStripePromptPay } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useEffect, useRef, useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripePromptPay(paymentSession?.provider_id):
      return (
        <StripePromptPayButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isStripeCard(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return (
        <Button
          disabled
          className="h-12 rounded-full bg-[#C8702A] hover:bg-[#A85C20] border-none transition-colors px-8"
        >
          Select a payment method
        </Button>
      )
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
        className="h-12 rounded-full bg-[#C8702A] hover:bg-[#A85C20] border-none transition-colors px-8"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
        className="h-12 rounded-full bg-[#C8702A] hover:bg-[#A85C20] border-none transition-colors px-8"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

const StripePromptPayButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrData, setQrData] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "waiting" | "paid">("idle")

  const stripe = useStripe()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
  const clientSecret = session?.data?.client_secret as string | undefined

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const completeOrder = async () => {
    await placeOrder().catch((err) => setErrorMessage(err.message))
  }

  const handlePayment = async () => {
    setErrorMessage(null)
    if (!stripe || !clientSecret) {
      setErrorMessage("Payment is not ready. Please refresh and try again.")
      return
    }
    setSubmitting(true)

    const { error, paymentIntent } = await stripe.confirmPromptPayPayment(
      clientSecret,
      {
        payment_method: {
          billing_details: {
            name: `${cart.billing_address?.first_name ?? ""} ${
              cart.billing_address?.last_name ?? ""
            }`.trim(),
            email: cart.email ?? undefined,
          },
        },
      },
      { handleActions: false }
    )

    if (error) {
      setErrorMessage(error.message || "PromptPay payment failed")
      setSubmitting(false)
      return
    }

    const nextAction = paymentIntent?.next_action as any
    const qr = nextAction?.promptpay_display_qr_code
    if (qr?.image_url_png) {
      setQrImage(qr.image_url_png)
      setQrData(qr.data || null)
      setStatus("waiting")

      pollRef.current = setInterval(async () => {
        if (!stripe || !clientSecret) return
        const { paymentIntent: pi } = await stripe.retrievePaymentIntent(
          clientSecret
        )
        if (pi?.status === "succeeded") {
          if (pollRef.current) clearInterval(pollRef.current)
          setStatus("paid")
          await completeOrder()
        } else if (pi?.status === "canceled" || pi?.status === "requires_payment_method") {
          if (pollRef.current) clearInterval(pollRef.current)
          setErrorMessage("Payment was not completed. Please try again.")
          setSubmitting(false)
        }
      }, 2500)
    } else if (paymentIntent?.status === "succeeded") {
      setStatus("paid")
      await completeOrder()
    } else {
      setErrorMessage("PromptPay did not return a QR code. Please try again.")
      setSubmitting(false)
    }
  }

  if (qrImage) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="text-center">
          <p className="font-display text-lg text-dark mb-1">
            Scan with your banking app
          </p>
          <p className="text-sm text-dark/60">
            {status === "waiting"
              ? "Waiting for payment…"
              : "Payment confirmed"}
          </p>
        </div>
        <img
          src={qrImage}
          alt="PromptPay QR code"
          className="w-60 h-60 rounded-2xl border border-gray-200"
        />
        {qrData && (
          <code className="text-[10px] text-dark/40 break-all max-w-full">
            {qrData}
          </code>
        )}
        <ErrorMessage
          error={errorMessage}
          data-testid="stripe-payment-error-message"
        />
      </div>
    )
  }

  return (
    <>
      <Button
        disabled={!stripe || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
        className="h-12 rounded-full bg-[#C8702A] hover:bg-[#A85C20] border-none transition-colors px-8"
      >
        Show PromptPay QR
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
