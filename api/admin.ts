import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getOrders, getOrderBySessionId, updateTracking, type Order } from './_lib/orders.js';
import { rateLimit, getClientIp } from './_lib/rateLimit.js';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL ?? 'orders@gingerbros.co';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
  if (!resend) {
    console.log('[SHIPPING NOTIFICATION] RESEND_API_KEY not configured — skipping email for', order.sessionId);
    return false;
  }

  const recipients = new Set<string>();
  if (order.customerEmail) recipients.add(order.customerEmail);
  if (order.isGift && order.recipientEmail) recipients.add(order.recipientEmail);
  if (recipients.size === 0) return false;

  const orderId = order.sessionId.slice(-8).toUpperCase();
  let sent = false;
  for (const to of recipients) {
    try {
      await resend.emails.send({
        from: `GingerBros <${fromEmail}>`,
        to,
        subject: `Your GingerBros order #${orderId} is on its way! 🚚`,
        html: shippingNotificationHtml(order),
      });
      sent = true;
    } catch (err) {
      console.error('Failed to send shipping email to', to, err);
    }
  }
  return sent;
}

function shippingNotificationHtml(order: Order): string {
  const orderId = order.sessionId.slice(-8).toUpperCase();
  const carrier = order.trackingCarrier?.trim();
  const itemRows = order.items
    .map(
      (li) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${li.description}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${li.quantity}</td>
        </tr>`
    )
    .join('');

  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2410;">
    <h2 style="color:#3D2410;">Your order is on its way! 🚚</h2>
    <p>Hi ${order.customerName ?? 'there'},</p>
    <p>Good news — your GingerBros order has shipped. Because this is a living, unpasteurized brew, please refrigerate it as soon as it arrives.</p>
    <div style="background:#F5F0EB;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:0 0 4px 0;font-size:14px;"><strong>Order:</strong> #${orderId}</p>
      <p style="margin:0 0 4px 0;font-size:14px;"><strong>Tracking number:</strong> ${order.trackingNumber}</p>
      ${carrier ? `<p style="margin:0;font-size:14px;"><strong>Carrier:</strong> ${carrier}</p>` : ''}
    </div>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead><tr style="background:#F5F0EB;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p style="font-size:14px;">Track your order anytime at <a href="https://gingerbrosshop.com/track" style="color:#C0532B;">gingerbrosshop.com/track</a> using your email and order number <strong>${orderId}</strong>.</p>
    <p style="margin-top:24px;font-size:13px;color:#888;">Questions? Just reply to this email.</p>
  </div>`;
}
