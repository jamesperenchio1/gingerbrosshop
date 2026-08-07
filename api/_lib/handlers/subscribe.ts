import { randomInt } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM_NEWSLETTER, UNSUBSCRIBE_HEADERS, welcomeWithCodeHtml, welcomeHtml } from '../email.js';

const audienceId = process.env.RESEND_AUDIENCE_ID;

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

  const email = (req.body?.email as string)?.toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const resend = getResend();
  if (!resend) {
    res.status(500).json({ error: 'Newsletter service is not configured.' });
    return;
  }

  try {
    if (audienceId) {
      const { error } = await resend.contacts.create({ email, audienceId, unsubscribed: false });
      if (error) console.error('Resend audience error:', error);
    }

    const redis = getRedis();
    const verificationEnabled = redis !== null;

    if (verificationEnabled) {
      const code = randomInt(100000, 999999).toString();
      await redis.set(`verify:${email}`, code, { ex: 86400 }); // 24h TTL

      await resend.emails.send({
        from: MAIL_FROM_NEWSLETTER,
        to: email,
        subject: 'Your GingerBros code is inside 🫚',
        html: welcomeWithCodeHtml(code),
        headers: UNSUBSCRIBE_HEADERS,
      });

      res.status(200).json({ success: true, verification: true });
    } else {
      // Redis not configured — fall back to plain welcome email
      await resend.emails.send({
        from: MAIL_FROM_NEWSLETTER,
        to: email,
        subject: 'Welcome to GingerBros 🫚',
        html: welcomeHtml(),
        headers: UNSUBSCRIBE_HEADERS,
      });

      res.status(200).json({ success: true, verification: false });
    }
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
  }
}
