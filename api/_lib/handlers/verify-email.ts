import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import Stripe from 'stripe';
import { getResend, MAIL_FROM_NEWSLETTER, UNSUBSCRIBE_HEADERS, discountCodeHtml } from '../email.js';

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  try { return Redis.fromEnv(); } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = (req.body?.email as string)?.toLowerCase().trim();
  const code = (req.body?.code as string)?.replace(/\s/g, '').trim();

  if (!email || !code) {
    res.status(400).json({ error: 'Email and code are required.' });
    return;
  }

  const redis = getRedis();
  if (!redis) {
    res.status(503).json({ error: 'Verification service not configured.' });
    return;
  }

  const key = `verify:${email}`;
  const storedCode = await redis.get<string>(key);

  if (!storedCode) {
    res.status(400).json({ error: 'Code expired or not found. Try subscribing again.' });
    return;
  }

  if (storedCode !== code) {
    res.status(400).json({ error: 'Incorrect code. Check your email and try again.' });
    return;
  }

  // Single-use: delete immediately on match
  await redis.del(key);

  // Create a unique, single-use Stripe promo code (10% off, 24h expiry)
  let promoCode = '';
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const stripe = new Stripe(stripeKey);
      const coupon = await stripe.coupons.create({
        percent_off: 10,
        duration: 'once',
      });
      const promo = await stripe.promotionCodes.create({
        coupon: coupon.id,
        max_redemptions: 1,
        expires_at: Math.floor(Date.now() / 1000) + 86400, // 24h
      });
      promoCode = promo.code;
    } catch (err) {
      console.error('Stripe promo code creation failed:', err);
    }
  }

  // Send the discount email
  const resend = getResend();
  if (resend && promoCode) {
    try {
      await resend.emails.send({
        from: MAIL_FROM_NEWSLETTER,
        to: email,
        subject: `Your 10% off code is here — ${promoCode} 🎉`,
        html: discountCodeHtml(promoCode),
        headers: UNSUBSCRIBE_HEADERS,
      });
    } catch (err) {
      console.error('Discount email send failed:', err);
    }
  }

  res.status(200).json({ success: true, sent: !!promoCode });
}
