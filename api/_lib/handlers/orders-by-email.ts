import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders } from '../orders.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `orders-by-email:${getClientIp(req)}`, limit: 20, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const email = (req.query.email as string | undefined)?.toLowerCase().trim();
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'A valid email is required.' });
    return;
  }

  const all = await getOrders();
  const orders = all
    .filter((o) => (o.customerEmail ?? '').toLowerCase() === email)
    .map((o) => ({
      sessionId: o.sessionId,
      orderId: o.sessionId.slice(-8).toUpperCase(),
      amountTotal: o.amountTotal,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items,
      trackingNumber: o.trackingNumber,
      trackingCarrier: o.trackingCarrier,
      isGift: o.isGift,
      mode: o.mode,
    }));

  res.status(200).json({ orders });
}
