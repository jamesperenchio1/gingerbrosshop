import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getOrCreateReferralCode,
  getPoints,
  getReferralCount,
  getReferralOwner,
  recordReferralUsage,
  addPoints,
} from '../referrals.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: fetch a customer's referral code, points, and referral count.
  if (req.method === 'GET') {
    const email = (req.query.email as string)?.toLowerCase().trim();
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    const code = await getOrCreateReferralCode(email);
    const points = await getPoints(email);
    const referrals = await getReferralCount(code);

    res.status(200).json({ code, points, referrals });
    return;
  }

  // POST: apply a referral code for a new customer.
  if (req.method === 'POST') {
    const { code, email } = req.body ?? {};
    if (!code || !email) {
      res.status(400).json({ error: 'Code and email required' });
      return;
    }

    const owner = await getReferralOwner(code.toUpperCase());
    if (!owner) {
      res.status(400).json({ error: 'Invalid referral code' });
      return;
    }

    if (owner === email.toLowerCase()) {
      res.status(400).json({ error: 'Cannot use your own referral code' });
      return;
    }

    await recordReferralUsage(code, email);
    // Give referrer 50 points (฿5 worth)
    await addPoints(owner, 50);
    // Give new customer 50 points
    await addPoints(email, 50);

    res.status(200).json({ success: true, discount: 50 });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
