import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM, adminLoginHtml } from '../email.js';
import {
  consumeLoginToken,
  createLoginToken,
  createSession,
  destroySession,
  getAdminEmail,
  isAllowedAdminEmail,
} from '../adminAuth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE = 'https://gingerbrosshop.com';

/** Only same-site admin pages are valid post-login destinations. */
function safeNext(next: unknown): string {
  return typeof next === 'string' && /^\/admin\/[\w/-]*$/.test(next) ? next : '/admin/links';
}

/**
 * Admin login API (actions travel as ?action= because Vercel only routes
 * single-segment /api paths here):
 *   POST ?action=request {email, next}  email a one-time login link
 *   POST ?action=verify  {token}        exchange the link's token for a session cookie
 *   GET  ?action=me                     who is signed in (401 if nobody)
 *   POST ?action=logout                 end this device's session
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const action = String(req.query.action ?? '');
  const ip = getClientIp(req);

  if (action === 'me' && req.method === 'GET') {
    const email = await getAdminEmail(req);
    if (!email) {
      res.status(401).json({ error: 'Not signed in' });
      return;
    }
    res.status(200).json({ email });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (action === 'request') {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    const [byIp, byEmail] = await Promise.all([
      rateLimit({ key: `admin-login-ip:${ip}`, limit: 5, windowSeconds: 900 }),
      rateLimit({ key: `admin-login-email:${email}`, limit: 3, windowSeconds: 900 }),
    ]);
    if (!byIp.allowed || !byEmail.allowed) {
      res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
      return;
    }

    // Same response whether or not the email is allowed, so the form can't be
    // used to discover which addresses are admins.
    const ok = { sent: true, message: 'If that email is an admin, a login link is on its way. It expires in 15 minutes.' };
    if (!isAllowedAdminEmail(email)) {
      console.warn(`Admin login requested for non-admin email from ${ip}`);
      res.status(200).json(ok);
      return;
    }

    const resend = getResend();
    if (!resend) {
      res.status(500).json({ error: 'Email is not configured.' });
      return;
    }
    const token = await createLoginToken(email);
    const link = `${SITE}/admin/login?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext(req.body?.next))}`;
    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to: email,
      subject: 'Log in to GingerBros admin',
      html: adminLoginHtml(link),
    });
    if (error) {
      console.error('Admin login email failed:', error);
      res.status(500).json({ error: 'Could not send the email. Try again.' });
      return;
    }
    res.status(200).json(ok);
    return;
  }

  if (action === 'verify') {
    const { allowed } = await rateLimit({ key: `admin-verify:${ip}`, limit: 10, windowSeconds: 900 });
    if (!allowed) {
      res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
      return;
    }
    const email = await consumeLoginToken(String(req.body?.token ?? ''));
    if (!email) {
      res.status(401).json({ error: 'This login link is invalid, expired or already used. Request a new one.' });
      return;
    }
    await createSession(res, email);
    res.status(200).json({ email });
    return;
  }

  if (action === 'logout') {
    await destroySession(req, res);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(404).json({ error: 'Not found' });
}
