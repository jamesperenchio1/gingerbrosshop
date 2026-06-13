import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveCartSnapshot } from './_lib/carts.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, items, subtotal, url } = req.body ?? {};
  if (!email || !Array.isArray(items)) {
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
