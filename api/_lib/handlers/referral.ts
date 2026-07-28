import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getOrCreateReferralCode,
  getReferralCount,
  getReferralOwner,
  recordReferralUsage,
} from '../referrals.js';
import { getCredit, addCredit } from '../credits.js';

const REFERRAL_CREDIT_MINOR = 500; // ฿5, granted to both sides of a referral

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: fetch a customer's referral code, store-credit balance, and referral count.
  if (req.method === 'GET') {
    const email = (req.query.email as string)?.toLowerCase().trim();
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

  // POST: apply a referral code for a new customer (used when a code is entered
  // outside the normal checkout flow, e.g. after account creation). The normal
  // path is via `referralCode` on /api/checkout, recorded by the Stripe webhook
  // once the order actually completes — this route exists for that alternate flow.
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
    // Real, spendable store credit — automatically applied as a discount on
    // each side's next checkout by api/_lib/handlers/checkout.ts.
    await addCredit(owner, REFERRAL_CREDIT_MINOR);
    await addCredit(email, REFERRAL_CREDIT_MINOR);

    res.status(200).json({ success: true, creditBaht: REFERRAL_CREDIT_MINOR / 100 });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
