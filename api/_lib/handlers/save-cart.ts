import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveCartSnapshot } from '../carts.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `save-cart:${getClientIp(req)}`, limit: 30, windowSeconds: 3600 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests.' });
    return;
  }

  const { email, items, subtotal, url } = req.body ?? {};
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email) || !Array.isArray(items) || items.length > 50) {
    res.status(400).json({ error: 'Invalid data' });
    return;
  }

  await saveCartSnapshot(email, {
    email,
    items,
    subtotal,
    url,
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({ saved: true });
}
