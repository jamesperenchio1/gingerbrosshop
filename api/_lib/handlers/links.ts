import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getLinkPageConfig, recordLinkEvent, addLinkPageSignup, getQrCode, recordQrScan } from '../linkpage.js';
import { publicView } from '../linkpageSchema.js';
import subscribe from './subscribe.js';

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|headless|lighthouse/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Which sub-action this request is. Vercel only routes single-segment paths to
 * api/[...path].ts, so sub-actions travel as query params:
 *   /api/links                 → public config
 *   /api/links?action=event    → analytics beacon
 *   /api/links?action=signup   → email signup
 *   /api/links?qr=<slug>       → QR redirect (public URL /q/<slug>, see vercel.json)
 */
function subAction(req: VercelRequest): [string | undefined, string | undefined] {
  const q = (k: string) => {
    const v = req.query[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const qr = q('qr');
  if (qr !== undefined) return ['qr', qr];
  // Vercel may hand us the pre-rewrite URL (/q/<slug>) instead of the query.
  const segments = (req.url ?? '').split('?')[0].split('/').filter(Boolean);
  if (segments[0] === 'q') return ['qr', segments[1] ?? ''];
  return [q('action'), undefined];
}

function header(req: VercelRequest, name: string): string {
  const v = req.headers[name];
  return (Array.isArray(v) ? v[0] : v) ?? '';
}

function deviceType(ua: string): string {
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobi|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Collapse a referrer URL to a short, bounded source name (instagram, tiktok, direct, ...). */
function referrerSource(ref: unknown): string {
  if (typeof ref !== 'string' || !ref) return 'direct';
  let host: string;
  try {
    host = new URL(ref).hostname.replace(/^(www|m|l|lm)\./, '');
  } catch {
    return 'direct';
  }
  const known = ['instagram', 'facebook', 'tiktok', 'line', 'google', 'youtube', 'twitter', 'x', 'shopee', 'gingerbrosshop'];
  const hit = known.find((k) => host === `${k}.com` || host.startsWith(`${k}.`) || host.endsWith(`.${k}.com`));
  return hit ?? host.slice(0, 40);
}

/** Explicit `?src=` tag on the link (e.g. bio links, QR codes) — trusted over document.referrer. */
function sourceLabel(src: string): string {
  return src.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
}

function parseBody(req: VercelRequest): Record<string, unknown> {
  // sendBeacon posts text/plain, which Vercel leaves as a string.
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return (req.body ?? {}) as Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const [action, arg] = subAction(req);

  // GET /api/links → the public page config
  if (!action) {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const config = await getLinkPageConfig();
    // Scheduled links flip on/off at their start/end time, so keep the edge cache short.
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    res.status(200).json({ config: publicView(config) });
    return;
  }

  // GET /api/links?qr=<slug> → count the scan, redirect to the target (served at /q/<slug>)
  if (action === 'qr') {
    const slug = String(arg ?? '').toLowerCase();
    const code = slug ? await getQrCode(slug) : null;
    if (!code) {
      res.setHeader('Location', '/');
      res.status(302).end();
      return;
    }
    if (!BOT_UA.test(header(req, 'user-agent'))) {
      await recordQrScan(slug).catch((err) => console.error('QR scan record failed:', err));
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', code.targetUrl);
    res.status(302).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // POST /api/links?action=event → page view or link click (fire-and-forget beacon)
  if (action === 'event') {
    const ua = header(req, 'user-agent');
    const { allowed } = await rateLimit({ key: `links-event:${getClientIp(req)}`, limit: 120, windowSeconds: 60 });
    if (!allowed || BOT_UA.test(ua)) {
      res.status(204).end();
      return;
    }
    const body = parseBody(req);
    try {
      if (body.type === 'view') {
        const country = header(req, 'x-vercel-ip-country').slice(0, 2).toUpperCase() || 'XX';
        const src = typeof body.src === 'string' ? sourceLabel(body.src) : '';
        await recordLinkEvent({
          type: 'view',
          country: /^[A-Z]{2}$/.test(country) ? country : 'XX',
          device: deviceType(ua),
          // An explicit ?src= tag (QR codes, bio links, ...) beats document.referrer, which
          // in-app browsers like Instagram's often blank out or rewrite.
          referrer: src || referrerSource(body.referrer),
        });
      } else if (body.type === 'click' && typeof body.blockId === 'string' && /^[\w-]{1,64}$/.test(body.blockId)) {
        await recordLinkEvent({ type: 'click', blockId: body.blockId });
      }
    } catch (err) {
      console.error('Link event record failed:', err);
    }
    res.status(204).end();
    return;
  }

  // POST /api/links?action=signup → store for the admin export, then run the normal newsletter flow
  if (action === 'signup') {
    const email = (parseBody(req).email as string | undefined)?.toLowerCase().trim();
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    const { allowed } = await rateLimit({ key: `links-signup:${getClientIp(req)}`, limit: 5, windowSeconds: 60 });
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
      return;
    }
    await addLinkPageSignup(email).catch((err) => console.error('Link signup store failed:', err));
    req.body = { email };
    return subscribe(req, res);
  }

  res.status(404).json({ error: 'Not found' });
}
