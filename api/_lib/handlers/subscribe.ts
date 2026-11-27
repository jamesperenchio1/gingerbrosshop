import { randomInt } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM_NEWSLETTER, welcomeWithCodeHtml, welcomeHtml } from '../email.js';
import { sendEmail, withUnsubscribe } from '../mailer.js';
import { addSubscriber } from '../subscribers.js';
import { captureServerEvent } from '../posthog.js';
import { str } from '../input.js';

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  try { return Redis.fromEnv(); } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `subscribe:${getClientIp(req)}`, limit: 5, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const email = str(req.body?.email).toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  // Per address too, so the form can't be used to flood someone's inbox.
  const perAddress = await rateLimit({ key: `subscribe:email:${email}`, limit: 5, windowSeconds: 3600 });
  if (!perAddress.allowed) {
    res.status(429).json({ error: 'We have already sent several emails to that address. Try again in an hour.' });
    return;
  }

  if (!getResend()) {
    res.status(500).json({ error: 'Newsletter service is not configured.' });
    return;
  }

  try {
    const redis = getRedis();
    const verificationEnabled = redis !== null;

    if (verificationEnabled) {
      const code = randomInt(100000, 999999).toString();
      await redis.set(`verify:${email}`, code, { ex: 86400 }); // 24h TTL

      await sendEmail(
        await withUnsubscribe({
          from: MAIL_FROM_NEWSLETTER,
          to: email,
          subject: 'Confirm your email to get 10% off',
          html: welcomeWithCodeHtml(code),
        }),
      );

      await captureServerEvent('newsletter_subscribed', email, { verification_required: true });
      res.status(200).json({ success: true, verification: true });
    } else {
      // Redis not configured — fall back to plain welcome email
      await addSubscriber(email).catch((err) => console.error('Saving subscriber failed:', err));
      await sendEmail(
        await withUnsubscribe({
          from: MAIL_FROM_NEWSLETTER,
          to: email,
          subject: 'You are on the GingerBros list',
          html: welcomeHtml(),
        }),
      );

      await captureServerEvent('newsletter_subscribed', email, { verification_required: false });
      res.status(200).json({ success: true, verification: false });
    }
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
  }
}
