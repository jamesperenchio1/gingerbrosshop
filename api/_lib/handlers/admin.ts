import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders, getOrderBySessionId, updateTracking, type Order } from '../orders.js';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM, shippingNotificationHtml, boxReturnRewardHtml } from '../email.js';
import { addCredit } from '../credits.js';
import { getStripe } from '../stripe.js';

// Default reward for returning the foam box + bottles: ฿50 in satang. A returned
// box saves ~฿80, so ฿50 stays margin-positive while still delighting customers.
const BOX_RETURN_CREDIT = 5000;

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
    const body = req.body ?? {};

    // Box returned → grant email-keyed store credit and email the customer their
    // reward immediately so it auto-applies at their next checkout.
    if (body.action === 'grant-credit') {
      const email = (body.email as string | undefined)?.trim().toLowerCase();
      if (!email) {
        res.status(400).json({ error: 'Missing email' });
        return;
      }
      const amount = Number.isFinite(body.amount) && body.amount > 0 ? Math.round(body.amount) : BOX_RETURN_CREDIT;
      const balance = await addCredit(email, amount);

      let emailed = false;
      const resend = getResend();
      if (resend) {
        try {
          await resend.emails.send({
            from: MAIL_FROM,
            to: email,
            subject: `Your ฿${Math.round(amount / 100)} box-return reward is ready ♻️`,
            html: boxReturnRewardHtml(Math.round(amount / 100)),
          });
          emailed = true;
        } catch (err) {
          console.error('Failed to send box-return reward email:', err);
        }
      }

      res.status(200).json({ success: true, email, granted: amount, balance, emailed });
      return;
    }

    // Fallback for customers with no email on file: mint a one-time Stripe promo
    // code the owner can hand over in person. Works without any email-keyed credit.
    if (body.action === 'grant-code') {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) {
        res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
        return;
      }
      const amount = Number.isFinite(body.amount) && body.amount > 0 ? Math.round(body.amount) : BOX_RETURN_CREDIT;
      const stripe = getStripe(secret);
      try {
        const coupon = await stripe.coupons.create({
          amount_off: amount,
          currency: 'thb',
          duration: 'once',
          name: 'Box-return reward',
        });
        const promo = await stripe.promotionCodes.create({
          promotion: { type: 'coupon', coupon: coupon.id },
          max_redemptions: 1,
        });

        // If we happen to have an email, send the code too — otherwise the owner
        // reads it out from the response.
        const email = (body.email as string | undefined)?.trim().toLowerCase();
        let emailed = false;
        const resend = getResend();
        if (email && resend) {
          try {
            await resend.emails.send({
              from: MAIL_FROM,
              to: email,
              subject: `Your ฿${Math.round(amount / 100)} box-return reward is ready ♻️`,
              html: boxReturnRewardHtml(Math.round(amount / 100), promo.code),
            });
            emailed = true;
          } catch (err) {
            console.error('Failed to send box-return code email:', err);
          }
        }

        res.status(200).json({ success: true, code: promo.code, granted: amount, emailed });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stripe error';
        res.status(500).json({ error: message });
      }
      return;
    }

    const { sessionId, trackingNumber, trackingCarrier } = body;
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
