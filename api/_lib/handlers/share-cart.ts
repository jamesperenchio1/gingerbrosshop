import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { saveSharedCart, getSharedCart } from '../carts.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const id = (req.query.id as string | undefined)?.trim();
    if (!id) {
      res.status(400).json({ error: 'Cart ID is required' });
      return;
    }
    const items = await getSharedCart(id);
    if (!items) {
      res.status(404).json({ error: 'Cart link has expired or does not exist.' });
      return;
    }
    res.status(200).json({ items });
    return;
  }

  if (req.method === 'POST') {
    const { allowed } = await rateLimit({
      key: `share-cart:${getClientIp(req)}`,
      limit: 5,
      windowSeconds: 60,
    });
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }

    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const id = randomUUID();
    await saveSharedCart(id, items);

    const origin =
      (req.headers.origin as string | undefined) ??
      `https://${req.headers.host}`;

    res.status(200).json({ url: `${origin}/?cart=${id}` });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
