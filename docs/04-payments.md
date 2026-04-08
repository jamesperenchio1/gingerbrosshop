# Phase 4: Payments

## Strategy: Stripe-Native Everything

Since the Stripe account is registered in Thailand, **both card payments and PromptPay are handled natively by Stripe**. No custom payment provider needed.

## How It Works

1. `automaticPaymentMethods: true` in medusa-config.ts
2. Stripe Payment Element on checkout page detects THB currency
3. Automatically shows: Credit/Debit Card + PromptPay QR
4. PromptPay QR encodes the exact amount — **no free text entry**
5. Customer scans → confirms in banking app → Stripe receives webhook → order confirmed

## Stripe Dashboard Setup

### Test Mode (now)
1. Dashboard → Settings → Payment Methods → Enable "PromptPay"
2. Dashboard → Webhooks → Add endpoint:
   - URL: `https://api.gingerbrosshop.com/hooks/payment/stripe_stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
3. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET` in `.env`

### Live Mode (when ready to launch)
1. Complete Stripe Thailand onboarding/verification
2. Swap `sk_test_` → `sk_live_` in `.env`
3. Create new live webhook endpoint with same URL
4. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
5. Test a real PromptPay payment with a small amount

## Medusa Config (in medusa-config.ts)

```typescript
{
  resolve: "@medusajs/medusa/payment-stripe",
  id: "stripe",
  options: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    automaticPaymentMethods: true,
  },
}
```

## Storefront Checkout Flow

The Medusa Next.js starter already integrates Stripe Payment Element. The flow:

1. Customer fills shipping info
2. Selects shipping option (flat ฿60 or free over ฿500)
3. Stripe Payment Element renders — shows card fields + PromptPay option
4. If card: enters card → pays → redirect to confirmation
5. If PromptPay: sees QR code → scans with bank app → amount pre-filled → confirms → redirect to confirmation

## Test Cards & PromptPay Testing

### Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### PromptPay (test mode)
- Stripe test mode simulates PromptPay — shows a test QR
- Clicking "Authorize test payment" in the Stripe-hosted page completes it
- No real bank app needed during testing

## Currency Note

Medusa stores amounts in the smallest currency unit. For THB:
- ฿70 = 7000 (satang)
- ฿120 = 12000
- ฿500 = 50000

Stripe also uses this format, so no conversion needed between Medusa and Stripe.
