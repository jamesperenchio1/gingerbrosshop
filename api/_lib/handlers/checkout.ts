import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getStripe } from '../stripe.js';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getCredit } from '../credits.js';

interface CheckoutLine {
  // The Stripe price ID to purchase. `id` is accepted as a legacy alias.
  priceId?: string;
  id?: string;
  quantity: number;
  // The app-level product ID (e.g. "ginger-fizz") used to determine shipping.
  productId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `checkout:${getClientIp(req)}`, limit: 10, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const items = (req.body?.items ?? []) as CheckoutLine[];
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  const paymentMethod = (req.body?.paymentMethod as string | undefined) ?? 'card';
  const referralCode = (req.body?.referralCode as string | undefined) ?? '';
  const customerEmail = (req.body?.email as string | undefined)?.trim().toLowerCase() || '';
  const giftInfo = req.body?.giftInfo as { isGift: boolean; recipientEmail?: string; recipientName?: string; message?: string } | undefined;

  const stripe = getStripe(secret);

  // Resolve and validate every price directly against Stripe — Stripe is the
  // source of truth, so there is no per-product env var or hardcoded map.
  // Fetch all prices in one request instead of N round-trips to keep checkout fast.
  const priceIdToQuantity = new Map<string, number>();
  for (const item of items) {
    const priceId = item.priceId ?? item.id;
    if (!priceId) {
      res.status(400).json({ error: 'Missing price in cart item' });
      return;
    }
    const qty = Math.max(1, Math.min(24, Math.floor(Number(item.quantity) || 1)));
    priceIdToQuantity.set(priceId, (priceIdToQuantity.get(priceId) ?? 0) + qty);
  }

  let prices: Stripe.ApiList<Stripe.Price>;
  try {
    prices = await stripe.prices.list({
      ids: Array.from(priceIdToQuantity.keys()),
      limit: 100,
    });
  } catch {
    res.status(400).json({ error: 'Unable to verify products. Please try again.' });
    return;
  }

  const priceMap = new Map(prices.data.map(p => [p.id, p]));
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let recurringCount = 0;
  let subtotalMinor = 0;
  let subInterval: { interval: string; intervalCount: number } | null = null;
  for (const [priceId, qty] of priceIdToQuantity.entries()) {
    const price = priceMap.get(priceId);
    if (!price || !price.active) {
      res.status(400).json({ error: `Unknown product: ${priceId}` });
      return;
    }

    if (price.recurring) {
      recurringCount++;
      if (!subInterval) {
        subInterval = { interval: price.recurring.interval, intervalCount: price.recurring.interval_count };
      }
    }
    subtotalMinor += (price.unit_amount ?? 0) * qty;
    lineItems.push({ price: price.id, quantity: qty });
  }

  // Stripe Checkout subscription mode doesn't support shipping_options, so we
  // inject a flat delivery fee as a matching recurring line item instead.
  // Price IDs are the live delivery-fee prices created on the Stripe account.
  const DELIVERY_PRICE: Record<string, string> = {
    'week_1':  'price_1TlT9f4xTvnGlHCDrZQrZ4kI',
    'week_2':  'price_1TlT9h4xTvnGlHCDBXJjknzd',
    'month_1': 'price_1TlT9j4xTvnGlHCDwrgy2MEu',
  };
  const hasGingerFizzSub = recurringCount > 0 && items.some(i => i.productId === 'ginger-fizz');
  if (hasGingerFizzSub && subInterval) {
    const key = `${subInterval.interval}_${subInterval.intervalCount}`;
    const deliveryPriceId = DELIVERY_PRICE[key];
    if (deliveryPriceId) {
      lineItems.push({ price: deliveryPriceId, quantity: 1 });
      recurringCount++; // delivery is recurring — keep hasOneTime accurate
    }
  }

  const hasSubscription = recurringCount > 0;
  const hasOneTime = recurringCount < lineItems.length;

  if (hasSubscription && hasOneTime) {
    res.status(400).json({ error: 'Cannot mix one-time and subscription items. Please checkout separately.' });
    return;
  }

  // COD not available for subscriptions
  if (hasSubscription && paymentMethod === 'cod') {
    res.status(400).json({ error: 'Cash on Delivery is not available for subscriptions. Please use card payment.' });
    return;
  }

  const origin =
    (req.headers.origin as string | undefined) ??
    `https://${req.headers.host}`;

  const mode: Stripe.Checkout.SessionCreateParams.Mode = hasSubscription ? 'subscription' : 'payment';

  const metadata: Record<string, string> = {
    referralCode: referralCode || '',
  };
  if (giftInfo?.isGift) {
    metadata.isGift = 'true';
    metadata.recipientEmail = giftInfo.recipientEmail ?? '';
    metadata.recipientName = giftInfo.recipientName ?? '';
    metadata.giftMessage = giftInfo.message ?? '';
  }

  // Shipping: standard delivery is the default for everyone; cold-chain is an
  // optional upgrade when the cart contains ginger fizz.
  const FREE_SHIPPING_THRESHOLD = 50000; // ฿500 in satang
  const SHIPPING_FLAT = 10000; // ฿100 in satang
  const hasGingerFizz = items.some(i => i.productId === 'ginger-fizz');
  const shippingFree = subtotalMinor >= FREE_SHIPPING_THRESHOLD;
  const standardAmount = shippingFree ? 0 : SHIPPING_FLAT;
  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: standardAmount, currency: 'thb' },
        display_name: shippingFree ? 'Free standard shipping' : 'Standard shipping',
        delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 4 } },
      },
    },
  ];
  if (hasGingerFizz) {
    const coldChainAmount = shippingFree ? SHIPPING_FLAT : SHIPPING_FLAT * 2;
    shippingOptions.push({
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: coldChainAmount, currency: 'thb' },
        display_name: 'Cold-chain delivery',
        delivery_estimate: { minimum: { unit: 'business_day', value: 1 }, maximum: { unit: 'business_day', value: 2 } },
      },
    });
  }

  // Auto-apply the returnable-box store credit when the shopper's email has a
  // balance. Capped to the product subtotal so none is wasted (coupons discount
  // line items, not shipping). Stripe forbids combining `discounts` with
  // `allow_promotion_codes`, so a credited order can't also stack a typed code.
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (customerEmail) {
    const creditMinor = await getCredit(customerEmail);
    const appliedMinor = Math.min(creditMinor, subtotalMinor);
    if (appliedMinor > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: appliedMinor,
        currency: 'thb',
        duration: 'once',
        name: 'Box-return credit',
      });
      discounts = [{ coupon: coupon.id }];
      metadata.creditEmail = customerEmail;
      metadata.creditApplied = String(appliedMinor);
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      shipping_address_collection: { allowed_countries: ['TH'] },
      phone_number_collection: { enabled: true },
      customer_email: customerEmail || undefined,
      payment_method_types: paymentMethod === 'cod' ? ['card', 'promptpay'] : undefined,
      metadata,
      // A credited order uses `discounts`; otherwise let shoppers type a promo
      // code. The two are mutually exclusive in Stripe Checkout.
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      // One-time orders: collect shipping via Stripe's shipping_options (not
      // supported in subscription mode — see chilled delivery line item above),
      // always create a Customer for the self-service portal, and generate a
      // hosted invoice + PDF receipt. Stripe handles all three automatically for
      // recurring payments.
      ...(mode === 'payment'
        ? {
            shipping_options: shippingOptions,
            customer_creation: 'always' as const,
            invoice_creation: { enabled: true },
          }
        : {}),
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
