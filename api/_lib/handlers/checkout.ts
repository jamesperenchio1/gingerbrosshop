import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getStripe } from '../stripe.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

interface CheckoutLine {
  // The Stripe price ID to purchase. `id` is accepted as a legacy alias.
  priceId?: string;
  id?: string;
  quantity: number;
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
  const giftInfo = req.body?.giftInfo as { isGift: boolean; recipientEmail?: string; recipientName?: string; message?: string } | undefined;

  const stripe = getStripe(secret);

  // Resolve and validate every price directly against Stripe — Stripe is the
  // source of truth, so there is no per-product env var or hardcoded map.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let recurringCount = 0;
  for (const item of items) {
    const priceId = item.priceId ?? item.id;
    if (!priceId) {
      res.status(400).json({ error: 'Missing price in cart item' });
      return;
    }

    let price: Stripe.Price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch {
      res.status(400).json({ error: `Unknown product: ${priceId}` });
      return;
    }
    if (!price.active) {
      res.status(400).json({ error: `Unknown product: ${priceId}` });
      return;
    }

    if (price.recurring) recurringCount++;
    const qty = Math.max(1, Math.min(24, Math.floor(Number(item.quantity) || 1)));
    lineItems.push({ price: price.id, quantity: qty });
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

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      shipping_address_collection: { allowed_countries: ['TH'] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      payment_method_types: paymentMethod === 'cod' ? ['card', 'promptpay'] : undefined,
      metadata,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
