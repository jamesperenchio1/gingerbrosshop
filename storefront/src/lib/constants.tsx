import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"
import PromptPay from "@modules/common/icons/promptpay"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  "pp_stripe-promptpay_stripe": {
    title: "PromptPay",
    icon: <PromptPay />,
  },
  "pp_bank-transfer_manual": {
    title: "Bank transfer",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10l9-6 9 6M5 10v9h14v-9M9 19v-6M12 19v-6M15 19v-6" />
      </svg>
    ),
  },
  "pp_cod_manual": {
    title: "Cash on delivery",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 10v4M18 10v4" />
      </svg>
    ),
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
}

// Matches any Stripe-based provider (generic card, promptpay, ideal, bancontact, etc.)
export const isStripeLike = (providerId?: string) => {
  if (!providerId) return false
  return (
    providerId.startsWith("pp_stripe_") ||
    providerId.startsWith("pp_stripe-") ||
    providerId.startsWith("pp_medusa-")
  )
}

export const isStripePromptPay = (providerId?: string) => {
  return providerId?.startsWith("pp_stripe-promptpay") ?? false
}

// True only for Stripe providers that use the Card Element UI (not PromptPay/QR).
export const isStripeCard = (providerId?: string) => {
  if (!providerId) return false
  return (
    providerId.startsWith("pp_stripe_") || providerId.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}

// Offline / pay-later: bank transfer, COD, etc. Needs no external confirmation
// at the browser; order is created in pending state for the admin to confirm.
export const isManual = (providerId?: string) => {
  if (!providerId) return false
  return (
    providerId.startsWith("pp_system_default") ||
    providerId.startsWith("pp_bank-transfer") ||
    providerId.startsWith("pp_cod")
  )
}

export const paymentDescription: Record<string, string> = {
  "pp_stripe_stripe":
    "Visa, Mastercard, JCB, AMEX. Secured by Stripe — we never see your card.",
  "pp_stripe-promptpay_stripe":
    "Scan a QR with your Thai banking app. Payment confirms instantly.",
  "pp_bank-transfer_manual":
    "We'll email account details after checkout. Order ships once we see the transfer.",
  "pp_cod_manual":
    "Pay the courier in cash on delivery. Bangkok metro only — +฿20 handling fee.",
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
