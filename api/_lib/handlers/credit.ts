import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCredit } from '../credits.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

// Public lookup so the cart can show "฿100 box-return credit available" once a
// shopper enters their email. Returns only a balance — no personal data.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `credit:${getClientIp(req)}`, limit: 30, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const email = (req.query.email as string | undefined)?.trim();
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }

  const balanceMinor = await getCredit(email);
  res.status(200).json({ balance: balanceMinor, balanceBaht: Math.round(balanceMinor / 100) });
}
