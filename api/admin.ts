import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders, updateTracking } from './_lib/orders.js';
import { rateLimit, getClientIp } from './_lib/rateLimit.js';

function isAuthorized(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    console.error('ADMIN_SECRET is not configured');
    return false;
  }
  return auth === `Bearer ${expected}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { allowed } = await rateLimit({ key: `admin:${getClientIp(req)}`, limit: 30, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    const orders = await getOrders();
    res.status(200).json({ orders });
    return;
  }

  if (req.method === 'POST') {
    const { sessionId, trackingNumber, trackingCarrier } = req.body ?? {};
    if (!sessionId || !trackingNumber) {
      res.status(400).json({ error: 'Missing sessionId or trackingNumber' });
      return;
    }
    const order = await updateTracking(sessionId, trackingNumber, trackingCarrier);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, order });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
