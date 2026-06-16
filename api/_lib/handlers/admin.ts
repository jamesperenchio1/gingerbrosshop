import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders, getOrderBySessionId, updateTracking, type Order } from '../orders.js';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM, shippingNotificationHtml } from '../email.js';

function isAuthorized(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    console.error('ADMIN_SECRET is not configured');
    return false;
  }
  return auth === `Bearer ${expected}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { allowed } = await rateLimit({ key: `admin:${getClientIp(req)}`, limit: 30, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    const orders = await getOrders();
    res.status(200).json({ orders });
    return;
  }

  if (req.method === 'POST') {
    const { sessionId, trackingNumber, trackingCarrier } = req.body ?? {};
    if (!sessionId || !trackingNumber) {
      res.status(400).json({ error: 'Missing sessionId or trackingNumber' });
      return;
    }
    // Capture the prior tracking number so we only email the customer when the
    // tracking is newly added or actually changed — re-saving the same number
    // (or correcting an unrelated field) must not re-notify them.
    const previous = await getOrderBySessionId(sessionId);
    const order = await updateTracking(sessionId, trackingNumber, trackingCarrier);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const trackingChanged = previous?.trackingNumber !== order.trackingNumber;
    let emailed = false;
    if (trackingChanged) {
      emailed = await sendShippingNotification(order);
    }

    res.status(200).json({ success: true, order, emailed });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Notify the customer (and gift recipient, if any) that their order has shipped.
 * Failures are logged but never block the tracking update — the order is the
 * source of truth, the email is best-effort. Returns whether at least one email
 * was sent.
 */
async function sendShippingNotification(order: Order): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log('[SHIPPING NOTIFICATION] RESEND_API_KEY not configured — skipping email for', order.sessionId);
    return false;
  }

  const recipients = new Set<string>();
  if (order.customerEmail) recipients.add(order.customerEmail);
  if (order.isGift && order.recipientEmail) recipients.add(order.recipientEmail);
  if (recipients.size === 0) return false;

  const orderId = order.sessionId.slice(-8).toUpperCase();
  const html = shippingNotificationHtml(order);
  let sent = false;
  for (const to of recipients) {
    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to,
        subject: `Your GingerBros order #${orderId} is on its way! 🚚`,
        html,
      });
      sent = true;
    } catch (err) {
      console.error('Failed to send shipping email to', to, err);
    }
  }
  return sent;
}
