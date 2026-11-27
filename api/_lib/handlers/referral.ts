import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrCreateReferralCode, getReferralCount } from '../referrals.js';
import { getCredit } from '../credits.js';
import { str } from '../input.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: fetch a customer's referral code, store-credit balance, and referral count.
  if (req.method === 'GET') {
    const email = str(req.query.email).toLowerCase().trim();
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    const code = await getOrCreateReferralCode(email);
    const creditMinor = await getCredit(email);
    const referrals = await getReferralCount(code);

    res.status(200).json({ code, creditBaht: creditMinor / 100, referrals });
    return;
  }

  // Nothing else: credit comes off real orders, so only a completed purchase may
  // grant it (the Stripe webhook records `referralCode` from checkout).
  res.status(405).json({ error: 'Method not allowed' });
}
