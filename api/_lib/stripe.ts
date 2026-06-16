import Stripe from 'stripe';

/**
 * A Checkout Session widened to include `shipping_details`, which the Stripe
 * SDK types don't surface reliably across versions. Shared by every handler
 * that reads the customer's shipping address.
 */
export type SessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: { name?: string | null; address?: Stripe.Address | null } | null;
};

/** Construct a Stripe client from a known-present secret key. */
export function getStripe(secret: string): Stripe {
  return new Stripe(secret);
}
