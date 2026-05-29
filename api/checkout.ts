import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const PRICE_IDS: Record<string, string> = {
  pasteurized: process.env.STRIPE_PRICE_PASTEURIZED ?? '',
  'pasteurized-6pack': process.env.STRIPE_PRICE_PASTEURIZED_6PACK ?? '',
  unpasteurized: process.env.STRIPE_PRICE_UNPASTEURIZED ?? '',
};

interface CheckoutLine {
  id: string;
  quantity: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of items) {
    const priceId = PRICE_IDS[item.id];
    if (!priceId) {
      res.status(400).json({ error: `Unknown product: ${item.id}` });
      return;
    }
    const qty = Math.max(1, Math.min(24, Math.floor(Number(item.quantity) || 1)));
    lineItems.push({ price: priceId, quantity: qty });
  }

  const stripe = new Stripe(secret);
  const origin =
    (req.headers.origin as string | undefined) ??
    `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      shipping_address_collection: { allowed_countries: ['TH'] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
