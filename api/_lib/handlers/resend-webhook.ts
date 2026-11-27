import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { getClientIp } from '../rateLimit.js';
import { deliveryAlertHtml, FROM_EMAIL, SELLER_EMAIL } from '../email.js';
import { sendEmail } from '../mailer.js';
import { suppressEmail } from '../subscribers.js';
import { captureServerException } from '../posthog.js';

/**
 * Resend calls this when mail does not arrive (sent from the site or from a mail
 * app through Resend), so a bounce is never silent: the owner gets an email.
 *
 * With RESEND_WEBHOOK_SECRET set, only correctly signed events are accepted
 * (Svix signatures). Until then callers are checked against Resend's published
 * webhook addresses; Vercel sets x-forwarded-for itself, so it can't be faked.
 */
const RESEND_IPV4 = new Set(['44.228.126.217', '50.112.21.217', '52.24.126.164', '54.148.139.208']);
const RESEND_IPV6 = /^2600:1f24:0?0?64:8[0-9a-f]{3}:/i; // 2600:1f24:64:8000::/52
const MAX_AGE_SECONDS = 300;

async function rawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

function signedBySecret(req: VercelRequest, body: string, secret: string): boolean {
  const header = (name: string) => String(req.headers[name] ?? '');
  const timestamp = header('svix-timestamp');
  if (!(Math.abs(Date.now() / 1000 - Number(timestamp)) <= MAX_AGE_SECONDS)) return false;
  const hmac = createHmac('sha256', Buffer.from(secret.replace(/^whsec_/, ''), 'base64'));
  hmac.update(`${header('svix-id')}.${timestamp}.${body}`);
  const expected = Buffer.from(hmac.digest('hex'), 'hex');
  return header('svix-signature')
    .split(' ')
    .some((part) => {
      const given = Buffer.from(part.split(',')[1] ?? '', 'base64');
      return given.length === expected.length && timingSafeEqual(given, expected);
    });
}

/** The event, or null if the caller can't be trusted. */
async function verifiedEvent(req: VercelRequest): Promise<ResendEvent | null> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    const ip = getClientIp(req);
    return RESEND_IPV4.has(ip) || RESEND_IPV6.test(ip) ? ((req.body ?? {}) as ResendEvent) : null;
  }
  // Read before anything touches req.body: the signature covers the exact bytes.
  const body = await rawBody(req);
  if (!signedBySecret(req, body, secret)) return null;
  try {
    return JSON.parse(body) as ResendEvent;
  } catch {
    return null;
  }
}

/** `Name <a@b.co>` or `a@b.co` -> `b.co`. The address is the last <...> part. */
function senderDomain(from: string): string {
  const address = from.match(/<([^<>]*)>\s*$/)?.[1] ?? from;
  return address.trim().split('@').pop()!.toLowerCase();
}

const PROBLEMS: Record<string, string> = {
  'email.bounced': 'Bounced',
  'email.complained': 'Marked as spam',
  'email.failed': 'Failed to send',
  'email.suppressed': 'Blocked (address bounced before)',
};

const ALERT_PREFIX = 'Email not delivered';

interface ResendEvent {
  type?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    bounce?: { type?: string; message?: string };
    failed?: { reason?: string };
    suppressed?: { message?: string };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const event = await verifiedEvent(req);
  if (!event) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const problem = PROBLEMS[event.type ?? ''];
  const data = event.data;
  const recipients = data?.to ?? [];
  // Other projects share this Resend account; only this domain's mail is ours.
  if (!problem || !data?.email_id || recipients.length === 0 || senderDomain(data.from ?? '') !== 'gingerbrosshop.com') {
    res.status(200).json({ ignored: true });
    return;
  }

  const redis = Redis.fromEnv();
  const seenKey = `email:alerted:${data.email_id}:${event.type}`;
  if (!(await redis.set(seenKey, 1, { nx: true, ex: 7 * 86400 }))) {
    res.status(200).json({ duplicate: true });
    return;
  }

  const owner = (SELLER_EMAIL || 'gingerbros.brew@gmail.com').toLowerCase();
  // Alerting the owner about mail that could not reach the owner would loop.
  if (recipients.some((r) => r.toLowerCase() === owner) || data.subject?.startsWith(ALERT_PREFIX)) {
    captureServerException(new Error(`${problem}: owner alert address`), 'email', { subject: data.subject });
    console.error(`${problem} on mail to the alert address:`, data.subject);
    res.status(200).json({ logged: true });
    return;
  }

  try {
    const permanent = event.type === 'email.complained' || data.bounce?.type === 'Permanent';
    if (permanent) for (const address of recipients) await suppressEmail(address);

    await sendEmail({
      from: `GingerBros Alerts <${FROM_EMAIL}>`,
      to: owner,
      subject: `${ALERT_PREFIX}: ${recipients.join(', ')}`,
      html: deliveryAlertHtml({
        problem,
        to: recipients.join(', '),
        from: data.from ?? '',
        subject: data.subject ?? '',
        reason: data.bounce?.message ?? data.failed?.reason ?? data.suppressed?.message ?? '',
      }),
    });
  } catch (err) {
    // Forget that we saw it, and fail the request so Resend delivers it again.
    await redis.del(seenKey);
    console.error('Delivery alert failed:', err);
    captureServerException(err, 'email', { context: 'delivery-alert' });
    res.status(500).json({ error: 'Alert not sent' });
    return;
  }

  res.status(200).json({ alerted: true });
}
