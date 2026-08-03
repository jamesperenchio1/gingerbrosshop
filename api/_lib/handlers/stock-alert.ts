import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { subscribeStockAlert } from '../stockAlerts.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({
    key: `stock-alert:${getClientIp(req)}`,
    limit: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const email = (req.body?.email as string | undefined)?.trim().toLowerCase();
  const productId = (req.body?.productId as string | undefined)?.trim();

  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'A valid email is required.' });
    return;
  }
  if (!productId) {
    res.status(400).json({ error: 'Product ID is required.' });
    return;
  }

  await subscribeStockAlert(productId, email);
  res.status(200).json({ subscribed: true });
}
