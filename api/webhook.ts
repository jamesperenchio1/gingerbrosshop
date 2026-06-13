import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { saveOrder } from './_lib/orders.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const resendApiKey = process.env.RESEND_API_KEY;
const sellerEmail = process.env.SELLER_EMAIL;
const fromEmail = process.env.FROM_EMAIL ?? 'orders@gingerbros.co';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

  const stripe = new Stripe(stripeSecret);
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
    const session = event.data.object as Stripe.Checkout.Session & { shipping_details?: { name?: string | null; address?: Stripe.Address | null } | null };

    // Expand line items for the email
    let lineItems: Stripe.LineItem[] = [];
    try {
      const itemsRes = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      lineItems = itemsRes.data;
    } catch (err) {
      console.error('Failed to fetch line items:', err);
    }

    const isSubscription = session.mode === 'subscription';
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

    // Send seller notification
    if (resend && sellerEmail) {
      try {
        await resend.emails.send({
          from: `GingerBros Orders <${fromEmail}>`,
          to: sellerEmail,
          subject: `New Order #${session.id.slice(-8).toUpperCase()} — ฿${(session.amount_total ?? 0) / 100}`,
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
          from: `GingerBros <${fromEmail}>`,
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
          from: `GingerBros <${fromEmail}>`,
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

type SessionWithShipping = Stripe.Checkout.Session & { shipping_details?: { name?: string | null; address?: Stripe.Address | null } | null };

function sellerNotificationHtml(session: SessionWithShipping, items: Stripe.LineItem[]) {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = ((session.amount_total ?? 0) / 100).toLocaleString();
  const isSub = session.mode === 'subscription';
  const itemRows = items
    .map(
      (li) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${li.description}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${li.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">฿${(li.amount_total / 100).toLocaleString()}</td>
        </tr>`
    )
    .join('');

  const shipping = session.shipping_details;
  const shippingHtml = shipping
    ? `<p><strong>Shipping to:</strong><br>${shipping.name}<br>${Object.values(shipping.address ?? {}).filter(Boolean).join(', ')}</p>`
    : '';

  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
    <h2 style="color:#3D2410;">New Order Received 🍺</h2>
    <p>Order #${orderId} has been paid${isSub ? ' — <strong>Monthly Subscription</strong>' : ''}.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead><tr style="background:#F5F0EB;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th><th style="padding:8px;text-align:right;">Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p style="font-size:18px;font-weight:600;">Total: ฿${total}${isSub ? '/month' : ''}</p>
    ${shippingHtml}
    <p style="margin-top:24px;font-size:13px;color:#666;">
      Add tracking at:<br>
      <a href="${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com'}/admin/orders">Admin Orders</a>
    </p>
  </div>`;
}

function giftEmailHtml(session: SessionWithShipping, items: Stripe.LineItem[], recipientName: string | null, message: string | null, senderName: string) {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = ((session.amount_total ?? 0) / 100).toLocaleString();
  const itemRows = items
    .map(
      (li) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${li.description}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${li.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">฿${(li.amount_total / 100).toLocaleString()}</td></tr>`
    )
    .join('');

  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2410;">
    <h2 style="color:#3D2410;">You have received a gift! 🎁</h2>
    <p>Hi ${recipientName ?? 'there'},</p>
    <p><strong>${senderName}</strong> has sent you a GingerBros gift subscription.</p>
    ${message ? `<p style="background:#F5F0EB;padding:12px;border-radius:8px;font-style:italic;">"${message}"</p>` : ''}
    <p style="font-size:14px;color:#666;">Order #${orderId}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead><tr style="background:#F5F0EB;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th><th style="padding:8px;text-align:right;">Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p style="font-size:18px;font-weight:600;">Total: ฿${total}</p>
    <p style="margin-top:24px;font-size:13px;color:#888;">You will receive shipping updates once the order is dispatched.</p>
  </div>`;
}

function customerInvoiceHtml(session: SessionWithShipping, items: Stripe.LineItem[]) {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = ((session.amount_total ?? 0) / 100).toLocaleString();
  const isSub = session.mode === 'subscription';
  const itemRows = items
    .map(
      (li) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${li.description}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${li.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">฿${(li.amount_total / 100).toLocaleString()}</td>
        </tr>`
    )
    .join('');

  const shipping = session.shipping_details;
  const shippingHtml = shipping
    ? `<p style="color:#555;font-size:14px;"><strong>Shipping to:</strong><br>${shipping.name}<br>${Object.values(shipping.address ?? {}).filter(Boolean).join(', ')}</p>`
    : '';

  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2410;">
    <h2 style="color:#3D2410;">Thank you for your order! 🍺</h2>
    <p>Hi ${session.customer_details?.name ?? 'there'},</p>
    <p>We've received your order and will send tracking details once your GingerBros ships.</p>
    <p style="font-size:14px;color:#666;">Order #${orderId}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead><tr style="background:#F5F0EB;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th><th style="padding:8px;text-align:right;">Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p style="font-size:18px;font-weight:600;">Total: ฿${total}${isSub ? '/month' : ''}</p>
    ${shippingHtml}
    ${isSub ? '<p style="margin-top:16px;font-size:13px;color:#888;">This is a monthly subscription. You can cancel anytime from your Stripe customer portal.</p>' : ''}
    <p style="margin-top:24px;font-size:13px;color:#888;">Questions? Reply to this email.</p>
  </div>`;
}
