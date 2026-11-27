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
 * Callers are checked against Resend's published webhook source addresses
 * (resend.com/docs/webhooks). Vercel sets x-forwarded-for itself, so a caller
 * cannot fake it.
 */
const RESEND_IPV4 = new Set(['44.228.126.217', '50.112.21.217', '52.24.126.164', '54.148.139.208']);
const RESEND_IPV6 = /^2600:1f24:0?0?64:8[0-9a-f]{3}:/i; // 2600:1f24:64:8000::/52

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

  const ip = getClientIp(req);
  if (!RESEND_IPV4.has(ip) && !RESEND_IPV6.test(ip)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const event = (req.body ?? {}) as ResendEvent;
  const problem = PROBLEMS[event.type ?? ''];
  const data = event.data;
  const recipients = data?.to ?? [];
  // Other projects share this Resend account; only this domain's mail is ours.
  if (!problem || !data?.email_id || recipients.length === 0 || !/@gingerbrosshop\.com\b/i.test(data.from ?? '')) {
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
