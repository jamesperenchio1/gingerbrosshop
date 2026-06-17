import { Redis } from '@upstash/redis';

// Store credit (e.g. the ฿100 returnable-box reward) keyed by customer email.
// Amounts are kept in minor units (satang) to match Stripe's coupon amount_off.
const redis = Redis.fromEnv();
const CREDIT_KEY = 'store_credit';

function key(email: string): string {
  return `${CREDIT_KEY}:${email.toLowerCase().trim()}`;
}

/** Current credit balance for an email, in satang (0 when none). */
export async function getCredit(email: string): Promise<number> {
  if (!email) return 0;
  try {
    return (await redis.get<number>(key(email))) ?? 0;
  } catch (err) {
    console.error('Credit read error:', err);
    return 0;
  }
}

/** Add credit (satang) to an email and return the new balance. */
export async function addCredit(email: string, amountMinor: number): Promise<number> {
  const current = await getCredit(email);
  const next = current + Math.max(0, Math.round(amountMinor));
  await redis.set(key(email), next);
  return next;
}

/** Subtract credit (satang), never below zero, and return the new balance. */
export async function consumeCredit(email: string, amountMinor: number): Promise<number> {
  const current = await getCredit(email);
  const next = Math.max(0, current - Math.max(0, Math.round(amountMinor)));
  await redis.set(key(email), next);
  return next;
}
