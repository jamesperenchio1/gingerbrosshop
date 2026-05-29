import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateTracking } from '../lib/orders';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = req.headers.authorization;
  const expected = process.env.ADMIN_SECRET ? `Bearer ${process.env.ADMIN_SECRET}` : null;

  if (expected && auth !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

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
}
