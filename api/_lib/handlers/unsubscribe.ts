import type { VercelRequest, VercelResponse } from '@vercel/node';
import { emailForToken, suppressEmail } from '../subscribers.js';
import { captureServerEvent } from '../posthog.js';

/** `s***@example.com`: enough to recognise, useless to anyone who guesses at links. */
function mask(email: string): string {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 1)}***@${domain}`;
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(res: VercelResponse, status: number, title: string, body: string) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.status(status).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · GingerBros</title></head>
<body style="margin:0;background:#F5EFE3;color:#3D2410;font-family:Helvetica,Arial,sans-serif;">
<main style="max-width:440px;margin:12vh auto;padding:32px 24px;background:#fff;">
<h1 style="font-size:22px;margin:0 0 12px;">${title}</h1>${body}
<p style="margin:24px 0 0;font-size:14px;"><a href="https://gingerbrosshop.com" style="color:#3D2410;">gingerbrosshop.com</a></p>
</main></body></html>`);
}

/**
 * GET shows a confirm button; only POST unsubscribes, because mail scanners open
 * links. Mail apps' one-click button POSTs here directly (RFC 8058).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = String(req.query?.t ?? '');
  const email = await emailForToken(token);
  if (!email) {
    page(res, 404, 'This link is not valid', '<p>Email <a href="mailto:hello@gingerbrosshop.com?subject=Unsubscribe">hello@gingerbrosshop.com</a> and we will remove you.</p>');
    return;
  }

  if (req.method === 'GET') {
    page(
      res,
      200,
      'Unsubscribe',
      `<p>Stop marketing emails to <strong>${escapeHtml(mask(email))}</strong>? Order and shipping emails are still sent.</p>
<form method="post" action="/api/unsubscribe?t=${encodeURIComponent(token)}"><button type="submit" style="background:#D4A34B;color:#3D2410;border:0;border-radius:4px;padding:12px 24px;font-size:15px;font-weight:700;cursor:pointer;">Unsubscribe</button></form>`,
    );
    return;
  }

  await suppressEmail(email);
  await captureServerEvent('newsletter_unsubscribed', email, {});
  page(res, 200, "You're unsubscribed", `<p>We won't send marketing emails to <strong>${escapeHtml(mask(email))}</strong> any more.</p>`);
}
