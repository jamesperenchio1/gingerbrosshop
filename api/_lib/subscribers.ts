/**
 * Who gets marketing mail: the newsletter list, the unsubscribe links, and the
 * addresses that must not be mailed again.
 */
import { randomBytes } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { getResend } from './email.js';
import { removeFromAllStockAlerts } from './stockAlerts.js';

const SITE_URL = 'https://gingerbrosshop.com';
const SUBSCRIBERS_KEY = 'newsletter:subscribers';
const SUPPRESSED_KEY = 'email:suppressed';
const tokenKey = (token: string) => `unsub:token:${token}`;
const emailKey = (email: string) => `unsub:email:${email}`;
const normalise = (email: string) => email.trim().toLowerCase();

const redis = () => Redis.fromEnv();

/** A stable, unguessable per-address link. Random, so it needs no signing secret. */
export async function unsubscribeUrl(email: string): Promise<string> {
  const address = normalise(email);
  const db = redis();
  let token = await db.get<string>(emailKey(address));
  if (!token) {
    token = randomBytes(18).toString('base64url');
    await db.set(tokenKey(token), address);
    await db.set(emailKey(address), token);
  }
  return `${SITE_URL}/api/unsubscribe?t=${token}`;
}

export async function emailForToken(token: string): Promise<string | null> {
  if (!/^[\w-]{1,64}$/.test(token)) return null;
  return redis().get<string>(tokenKey(token));
}

export async function isSuppressed(email: string): Promise<boolean> {
  return (await redis().sismember(SUPPRESSED_KEY, normalise(email))) === 1;
}

/** Mirror the state into Resend Contacts. Best effort: Redis is the source of truth. */
async function syncContact(action: () => Promise<{ error: unknown }>): Promise<void> {
  try {
    const { error } = await action();
    if (error) console.warn('Resend contact sync failed:', error);
  } catch (err) {
    console.warn('Resend contact sync failed:', err);
  }
}

export async function suppressEmail(email: string): Promise<void> {
  const address = normalise(email);
  const db = redis();
  await db.sadd(SUPPRESSED_KEY, address);
  await db.srem(SUBSCRIBERS_KEY, address);
  await removeFromAllStockAlerts(address);
  const resend = getResend();
  if (resend) await syncContact(() => resend.contacts.update({ email: address, unsubscribed: true }));
}

/** Call only once the person has proved they own the address. */
export async function addSubscriber(email: string): Promise<void> {
  const address = normalise(email);
  const db = redis();
  await db.srem(SUPPRESSED_KEY, address);
  await db.sadd(SUBSCRIBERS_KEY, address);
  const resend = getResend();
  if (!resend) return;
  await syncContact(async () => {
    const created = await resend.contacts.create({ email: address, unsubscribed: false });
    // An existing contact who unsubscribed earlier needs the flag cleared too.
    return created.error ? resend.contacts.update({ email: address, unsubscribed: false }) : created;
  });
}
