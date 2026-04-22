#!/bin/sh
# Fix Medusa payment-stripe bug where PromptPay provider throws:
#   "You cannot enable `automatic_payment_methods` and specify `payment_method_types`"
# when the module is configured with `automaticPaymentMethods: true` (needed for card).
# Gate automatic_payment_methods on there being no explicit payment_method_types.

STRIPE_BASE="/app/server/node_modules/@medusajs/payment-stripe/dist/core/stripe-base.js"

if [ ! -f "$STRIPE_BASE" ]; then
  echo "stripe-base.js not found at $STRIPE_BASE — skipping patch"
  exit 0
fi

# Before: options_?.automaticPaymentMethods ? { enabled: true } : undefined
# After:  (options_?.automaticPaymentMethods && !res.payment_method_types?.length) ? { enabled: true } : undefined
sed -i 's|(this.options_?.automaticPaymentMethods ? { enabled: true } : undefined)|((this.options_?.automaticPaymentMethods \&\& !res.payment_method_types?.length) ? { enabled: true } : undefined)|g' "$STRIPE_BASE"

if grep -q "this.options_?.automaticPaymentMethods && !res.payment_method_types" "$STRIPE_BASE"; then
  echo "Patched stripe-base.js: automatic_payment_methods now skipped when payment_method_types is set"
else
  echo "WARNING: stripe-base.js patch did not apply — Stripe payment conflict may persist"
  exit 1
fi
