import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const PRICE_IDS: Record<string, string> = {
  // One-time
  pasteurized: process.env.STRIPE_PRICE_PASTEURIZED ?? '',
  'pasteurized-6pack': process.env.STRIPE_PRICE_PASTEURIZED_6PACK ?? '',
  unpasteurized: process.env.STRIPE_PRICE_UNPASTEURIZED ?? '',
  // Subscriptions — pasteurized single
  'pasteurized-sub-week': process.env.STRIPE_PRICE_PASTEURIZED_SUB_WEEK ?? '',
  'pasteurized-sub-2week': process.env.STRIPE_PRICE_PASTEURIZED_SUB_2WEEK ?? '',
  'pasteurized-sub-month': process.env.STRIPE_PRICE_PASTEURIZED_SUB_MONTH ?? '',
  // Subscriptions — 6-pack
  'pasteurized-6pack-sub-week': process.env.STRIPE_PRICE_PASTEURIZED_6PACK_SUB_WEEK ?? '',
  'pasteurized-6pack-sub-2week': process.env.STRIPE_PRICE_PASTEURIZED_6PACK_SUB_2WEEK ?? '',
  'pasteurized-6pack-sub-month': process.env.STRIPE_PRICE_PASTEURIZED_6PACK_SUB_MONTH ?? '',
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

  const paymentMethod = (req.body?.paymentMethod as string | undefined) ?? 'card';
  const referralCode = (req.body?.referralCode as string | undefined) ?? '';
  const hasSubscription = items.some((i) => i.id.endsWith('-sub-week') || i.id.endsWith('-sub-2week') || i.id.endsWith('-sub-month'));
  const hasOneTime = items.some((i) => !i.id.includes('-sub-'));

  if (hasSubscription && hasOneTime) {
    res.status(400).json({ error: 'Cannot mix one-time and subscription items. Please checkout separately.' });
    return;
  }

  // COD not available for subscriptions
  if (hasSubscription && paymentMethod === 'cod') {
    res.status(400).json({ error: 'Cash on Delivery is not available for subscriptions. Please use card payment.' });
    return;
  }

  const giftInfo = req.body?.giftInfo as { isGift: boolean; recipientEmail?: string; recipientName?: string; message?: string } | undefined;

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
