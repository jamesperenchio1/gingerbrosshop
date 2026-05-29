import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders } from '../lib/orders';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = req.headers.authorization;
  const expected = process.env.ADMIN_SECRET ? `Bearer ${process.env.ADMIN_SECRET}` : null;

  if (expected && auth !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const orders = await getOrders();
  res.status(200).json({ orders });
}
