import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrCreateReferralCode, getPoints, getReferralCount } from './_lib/referrals.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = (req.query.email as string)?.toLowerCase().trim();
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }

  const code = await getOrCreateReferralCode(email);
  const points = await getPoints(email);
  const referrals = await getReferralCount(code);

  res.status(200).json({ code, points, referrals });
}
