import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import Stripe from 'stripe';
import { getResend, MAIL_FROM_NEWSLETTER, UNSUBSCRIBE_HEADERS, discountCodeHtml } from '../email.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

// The verification code is a 6-digit number (~900k values) that lives in Redis
// for 24h. Without a cap, an attacker could brute-force it for any email that
// was sent a code. We bound guessing two ways: a per-IP/per-email request rate
// limit, and a hard per-code failed-attempt counter that invalidates the code.
const MAX_ATTEMPTS = 5;
const CODE_TTL_SECONDS = 86400; // matches the 24h code lifetime set on subscribe

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

  // Bound the request volume per IP and per email before touching the code.
  const ip = getClientIp(req);
  const [ipRl, emailRl] = await Promise.all([
    rateLimit({ key: `verify-email:ip:${ip}`, limit: 10, windowSeconds: 60 }),
    rateLimit({ key: `verify-email:email:${email}`, limit: 10, windowSeconds: 60 }),
  ]);
  if (!ipRl.allowed || !emailRl.allowed) {
    res.status(429).json({ error: 'Too many attempts. Please try again in a minute.' });
    return;
  }

  const redis = getRedis();
  if (!redis) {
    res.status(503).json({ error: 'Verification service not configured.' });
    return;
  }

  const key = `verify:${email}`;
  const attemptsKey = `verify:attempts:${email}`;
  const storedCode = await redis.get<string>(key);

  if (!storedCode) {
    res.status(400).json({ error: 'Code expired or not found. Try subscribing again.' });
    return;
  }

  if (storedCode !== code) {
    // Atomically count the failed attempt; after MAX_ATTEMPTS, burn the code so
    // it can no longer be guessed and the user must request a fresh one.
    const attempts = await redis.incr(attemptsKey);
    await redis.expire(attemptsKey, CODE_TTL_SECONDS);
    if (attempts >= MAX_ATTEMPTS) {
      await redis.del(key);
      await redis.del(attemptsKey);
      res.status(429).json({ error: 'Too many incorrect attempts. Please subscribe again to get a new code.' });
      return;
    }
    res.status(400).json({ error: 'Incorrect code. Check your email and try again.' });
    return;
  }

  // Single-use: delete the code and reset the attempt counter on match.
  await redis.del(key);
  await redis.del(attemptsKey);

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
        promotion: { type: 'coupon', coupon: coupon.id },
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
        subject: `Your 10% off code: ${promoCode}`,
        html: discountCodeHtml(promoCode),
        headers: UNSUBSCRIBE_HEADERS,
      });
    } catch (err) {
      console.error('Discount email send failed:', err);
    }
  }

  res.status(200).json({ success: true, sent: !!promoCode, promoCode: promoCode || undefined });
}
