import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { rateLimit, getClientIp } from '../rateLimit.js';

/** GET /api/promo?code=XYZ: is this promo code usable, and what does it take off? */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');

  const { allowed } = await rateLimit({ key: `promo:${getClientIp(req)}`, limit: 30, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ valid: false });
    return;
  }

  const code = String(req.query.code ?? '').trim().slice(0, 40);
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!code || !/^[A-Za-z0-9_-]+$/.test(code) || !stripeKey) {
    res.status(200).json({ valid: false });
    return;
  }

  try {
    const stripe = new Stripe(stripeKey);
    const found = await stripe.promotionCodes.list({ code, active: true, limit: 1, expand: ['data.promotion.coupon'] });
    const promo = found.data[0];
    const coupon = promo?.promotion?.coupon;
    if (!promo || !coupon || typeof coupon === 'string' || coupon.valid === false) {
      res.status(200).json({ valid: false });
      return;
    }
    res.status(200).json({
      valid: true,
      code: promo.code,
      percentOff: coupon.percent_off ?? null,
      // THB minor units (satang) to baht
      amountOff: coupon.amount_off ? Math.round(coupon.amount_off / 100) : null,
    });
  } catch (err) {
    console.error('Promo lookup failed:', err);
    res.status(200).json({ valid: false });
  }
}
