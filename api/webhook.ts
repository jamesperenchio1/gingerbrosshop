import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getStripe, type SessionWithShipping } from './_lib/stripe.js';
import { saveOrder } from './_lib/orders.js';
import {
  getResend,
  MAIL_FROM,
  SELLER_EMAIL,
  FROM_EMAIL,
  money,
  sellerNotificationHtml,
  customerInvoiceHtml,
  giftEmailHtml,
} from './_lib/email.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!stripeSecret || !webhookSecret) {
    res.status(500).json({ error: 'Stripe keys not configured' });
    return;
  }

  const stripe = getStripe(stripeSecret);
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string | undefined;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig ?? '', webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed';
    console.error('Webhook error:', message);
    res.status(400).json({ error: message });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as SessionWithShipping;

    // Expand line items for the email
    let lineItems: Stripe.LineItem[] = [];
    try {
      const itemsRes = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      lineItems = itemsRes.data;
    } catch (err) {
      console.error('Failed to fetch line items:', err);
    }

    const isGift = session.metadata?.isGift === 'true';
    const recipientEmail = session.metadata?.recipientEmail ?? null;
    const recipientName = session.metadata?.recipientName ?? null;
    const giftMessage = session.metadata?.giftMessage ?? null;
    const referralCode = session.metadata?.referralCode ?? '';

    const order = {
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
      customerEmail: session.customer_details?.email ?? null,
      customerName: session.customer_details?.name ?? null,
      customerPhone: session.customer_details?.phone ?? null,
      shippingAddress: (session.shipping_details?.address as unknown as Record<string, unknown> | undefined) ?? null,
      items: lineItems.map((li) => ({
        id: li.price?.product?.toString() ?? li.id,
        description: li.description ?? 'Item',
        quantity: li.quantity ?? 1,
        amountTotal: li.amount_total,
      })),
      amountTotal: session.amount_total ?? 0,
      currency: session.currency?.toUpperCase() ?? 'THB',
      status: session.payment_status,
      mode: session.mode,
      isGift,
      recipientEmail,
      recipientName,
      giftMessage,
      referralCode,
      createdAt: new Date().toISOString(),
      trackingNumber: null,
      trackingCarrier: null,
    };

    await saveOrder(order);

    const resend = getResend();

    // Send seller notification
    if (resend && SELLER_EMAIL) {
      try {
        await resend.emails.send({
          from: `GingerBros Orders <${FROM_EMAIL}>`,
          to: SELLER_EMAIL,
          subject: `New Order #${session.id.slice(-8).toUpperCase()} — ฿${money(session.amount_total)}`,
          html: sellerNotificationHtml(session, lineItems),
        });
      } catch (err) {
        console.error('Failed to send seller email:', err);
      }
    } else {
      console.log('[SELLER NOTIFICATION] New order:', order);
    }

    // Send customer invoice/receipt
    if (resend && order.customerEmail) {
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: order.customerEmail,
          subject: `Your GingerBros Order Confirmation #${session.id.slice(-8).toUpperCase()}`,
          html: customerInvoiceHtml(session, lineItems),
        });
      } catch (err) {
        console.error('Failed to send customer email:', err);
      }
    }

    // Send gift email to recipient
    if (resend && isGift && recipientEmail) {
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: recipientEmail,
          subject: `${session.customer_details?.name ?? 'Someone'} sent you a GingerBros gift! 🍺`,
          html: giftEmailHtml(session, lineItems, recipientName, giftMessage, session.customer_details?.name ?? 'A friend'),
        });
      } catch (err) {
        console.error('Failed to send gift email:', err);
      }
    }

    // Record referral if code was used
    if (referralCode && order.customerEmail) {
      try {
        const { getReferralOwner, recordReferralUsage, addPoints } = await import('./_lib/referrals.js');
        const owner = await getReferralOwner(referralCode);
        if (owner && owner !== order.customerEmail.toLowerCase()) {
          await recordReferralUsage(referralCode, order.customerEmail);
          await addPoints(owner, 50);
          await addPoints(order.customerEmail, 50);
        }
      } catch {
        // silent
      }
    }
  }

  res.status(200).json({ received: true });
}
