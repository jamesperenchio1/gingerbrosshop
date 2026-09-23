import { createHash, randomBytes } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Admin auth: passwordless email login.
//   1. An allow-listed email (ADMIN_EMAILS) asks for a link → a random one-time
//      token is emailed; only its SHA-256 is stored, for 15 minutes.
//   2. The login page POSTs the token back → it is consumed (GETDEL) and a
//      30-day session is created. The session id lives only in an HttpOnly,
//      Secure, SameSite=Strict cookie; Redis stores its hash.
// Nothing secret ever sits in the page, sessionStorage or the URL after login.

const redis = Redis.fromEnv();

export const SESSION_COOKIE = 'gb_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const LOGIN_TOKEN_TTL_SECONDS = 15 * 60;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function allowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string): boolean {
  return allowedAdminEmails().includes(email.trim().toLowerCase());
}

/** Create a one-time login token for `email`; returns the raw token to email out. */
export async function createLoginToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await redis.set(`admin:login:${sha256(token)}`, email.toLowerCase(), { ex: LOGIN_TOKEN_TTL_SECONDS });
  return token;
}

/** Consume a login token (single use). Returns the email it was issued to, or null. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  if (!/^[\w-]{20,100}$/.test(token)) return null;
  const email = await redis.getdel<string>(`admin:login:${sha256(token)}`);
  // Re-check the allow-list so removing someone from ADMIN_EMAILS revokes pending links too.
  return email && isAllowedAdminEmail(email) ? email : null;
}

export async function createSession(res: VercelResponse, email: string): Promise<void> {
  const id = randomBytes(32).toString('base64url');
  await redis.set(`admin:session:${sha256(id)}`, email, { ex: SESSION_TTL_SECONDS });
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`,
  );
}

function readCookie(req: VercelRequest, name: string): string | null {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=') || null;
  }
  return null;
}

/** The signed-in admin's email, or null. */
export async function getAdminEmail(req: VercelRequest): Promise<string | null> {
  const id = readCookie(req, SESSION_COOKIE);
  if (!id || !/^[\w-]{20,100}$/.test(id)) return null;
  const email = await redis.get<string>(`admin:session:${sha256(id)}`);
  return email && isAllowedAdminEmail(email) ? email : null;
}

export async function destroySession(req: VercelRequest, res: VercelResponse): Promise<void> {
  const id = readCookie(req, SESSION_COOKIE);
  if (id) await redis.del(`admin:session:${sha256(id)}`);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

/**
 * Gate for admin API handlers. Requires a valid session cookie, and for
 * state-changing requests a same-origin Origin header (defence in depth on top
 * of SameSite=Strict).
 */
export async function isAdminAuthorized(req: VercelRequest): Promise<boolean> {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin && host && new URL(origin).host !== host) return false;
  }
  return (await getAdminEmail(req)) !== null;
}
