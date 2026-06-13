import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getReferralOwner, recordReferralUsage, addPoints } from './_lib/referrals.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

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
}
