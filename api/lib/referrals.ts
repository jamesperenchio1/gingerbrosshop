import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const REFERRAL_PREFIX = 'referral';
const POINTS_PREFIX = 'points';

function generateCode(email: string): string {
  const hash = email.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  return `BRO${Math.abs(hash).toString(36).toUpperCase().slice(0, 5)}`;
}

export async function getOrCreateReferralCode(email: string): Promise<string> {
  const key = `${REFERRAL_PREFIX}:code:${email.toLowerCase()}`;
  const existing = await redis.get<string>(key);
  if (existing) return existing;
  const code = generateCode(email);
  await redis.set(key, code);
  await redis.set(`${REFERRAL_PREFIX}:owner:${code}`, email.toLowerCase());
  return code;
}

export async function getReferralOwner(code: string): Promise<string | null> {
  return redis.get<string>(`${REFERRAL_PREFIX}:owner:${code.toUpperCase()}`);
}

export async function recordReferralUsage(code: string, referredEmail: string) {
  await redis.sadd(`${REFERRAL_PREFIX}:used:${code.toUpperCase()}`, referredEmail.toLowerCase());
}

export async function getReferralCount(code: string): Promise<number> {
  return redis.scard(`${REFERRAL_PREFIX}:used:${code.toUpperCase()}`);
}

export async function getPoints(email: string): Promise<number> {
  const pts = await redis.get<number>(`${POINTS_PREFIX}:${email.toLowerCase()}`);
  return pts ?? 0;
}

export async function addPoints(email: string, points: number) {
  const key = `${POINTS_PREFIX}:${email.toLowerCase()}`;
  const current = await getPoints(email);
  await redis.set(key, current + points);
}
