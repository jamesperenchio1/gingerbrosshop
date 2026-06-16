import Stripe from 'stripe';
import { Resend } from 'resend';
import type { SessionWithShipping } from './stripe.js';
import type { Order } from './orders.js';
import type { CartSnapshot } from './carts.js';

// ---------------------------------------------------------------------------
// Config — a single source of truth for the mail sender. Every endpoint that
// sends email (webhook, admin, subscribe, abandoned-cart-check) reads these.
// ---------------------------------------------------------------------------

const resendApiKey = process.env.RESEND_API_KEY;

export const FROM_EMAIL = process.env.FROM_EMAIL ?? 'orders@gingerbros.co';
export const SELLER_EMAIL = process.env.SELLER_EMAIL;

let resendClient: Resend | null | undefined;

/** Lazily-constructed shared Resend client, or null when not configured. */
export function getResend(): Resend | null {
  if (resendClient === undefined) {
    resendClient = resendApiKey ? new Resend(resendApiKey) : null;
  }
  return resendClient;
}

/** The standard `from` header used on every GingerBros email. */
export const MAIL_FROM = `GingerBros <${FROM_EMAIL}>`;

// ---------------------------------------------------------------------------
// Shared presentation helpers
// ---------------------------------------------------------------------------

/** Format Stripe minor units (e.g. satang) as a grouped major-unit string. */
export function money(minor: number | null | undefined): string {
  return ((minor ?? 0) / 100).toLocaleString();
}

/** Brand-styled outer wrapper shared by every email body. */
function layout(inner: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2410;">${inner}</div>`;
}

/** An items table. `totals: false` drops the price column (e.g. shipping email). */
function itemsTable(rows: string, totals = true): string {
  const header = totals
    ? `<tr style="background:#F5F0EB;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th><th style="padding:8px;text-align:right;">Total</th></tr>`
    : `<tr style="background:#F5F0EB;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th></tr>`;
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;"><thead>${header}</thead><tbody>${rows}</tbody></table>`;
}

function stripeRows(items: Stripe.LineItem[]): string {
  return items
    .map(
      (li) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${li.description}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${li.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">฿${money(li.amount_total)}</td>
        </tr>`
    )
    .join('');
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function sellerNotificationHtml(session: SessionWithShipping, items: Stripe.LineItem[]): string {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = money(session.amount_total);
  const isSub = session.mode === 'subscription';

  const shipping = session.shipping_details;
  const shippingHtml = shipping
    ? `<p><strong>Shipping to:</strong><br>${shipping.name}<br>${Object.values(shipping.address ?? {}).filter(Boolean).join(', ')}</p>`
    : '';

  const isGift = session.metadata?.isGift === 'true';
  const recipientName = session.metadata?.recipientName;
  const recipientEmail = session.metadata?.recipientEmail;
  const giftMessage = session.metadata?.giftMessage;
  const giftHtml = isGift
    ? `<div style="background:#F5F0EB;padding:12px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 4px 0;font-weight:600;">🎁 This order is a gift</p>
        <p style="margin:0;font-size:14px;"><strong>Recipient:</strong> ${recipientName ?? '—'}</p>
        <p style="margin:0;font-size:14px;"><strong>Recipient email:</strong> ${recipientEmail ?? '—'}</p>
        ${giftMessage ? `<p style="margin:8px 0 0 0;font-size:14px;font-style:italic;">“${giftMessage}”</p>` : ''}
      </div>`
    : '';

  const adminBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com';

  return layout(`
    <h2 style="color:#3D2410;">New Order Received 🍺</h2>
    <p>Order #${orderId} has been paid${isSub ? ' — <strong>Monthly Subscription</strong>' : ''}.</p>
    ${itemsTable(stripeRows(items))}
    <p style="font-size:18px;font-weight:600;">Total: ฿${total}${isSub ? '/month' : ''}</p>
    ${giftHtml}
    ${shippingHtml}
    <p style="margin-top:24px;font-size:13px;color:#666;">
      Add tracking at:<br>
      <a href="${adminBase}/admin/orders">Admin Orders</a>
    </p>`);
}

export function customerInvoiceHtml(session: SessionWithShipping, items: Stripe.LineItem[]): string {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = money(session.amount_total);
  const isSub = session.mode === 'subscription';

  const shipping = session.shipping_details;
  const shippingHtml = shipping
    ? `<p style="color:#555;font-size:14px;"><strong>Shipping to:</strong><br>${shipping.name}<br>${Object.values(shipping.address ?? {}).filter(Boolean).join(', ')}</p>`
    : '';

  return layout(`
    <h2 style="color:#3D2410;">Thank you for your order! 🍺</h2>
    <p>Hi ${session.customer_details?.name ?? 'there'},</p>
    <p>We've received your order and will send tracking details once your GingerBros ships.</p>
    <p style="font-size:14px;color:#666;">Order #${orderId}</p>
    ${itemsTable(stripeRows(items))}
    <p style="font-size:18px;font-weight:600;">Total: ฿${total}${isSub ? '/month' : ''}</p>
    ${shippingHtml}
    ${isSub ? '<p style="margin-top:16px;font-size:13px;color:#888;">This is a monthly subscription. You can cancel anytime from your Stripe customer portal.</p>' : ''}
    <p style="margin-top:24px;font-size:13px;color:#888;">Questions? Reply to this email.</p>`);
}

export function giftEmailHtml(
  session: SessionWithShipping,
  items: Stripe.LineItem[],
  recipientName: string | null,
  message: string | null,
  senderName: string
): string {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = money(session.amount_total);

  return layout(`
    <h2 style="color:#3D2410;">You have received a gift! 🎁</h2>
    <p>Hi ${recipientName ?? 'there'},</p>
    <p><strong>${senderName}</strong> has sent you a GingerBros gift.</p>
    ${message ? `<p style="background:#F5F0EB;padding:12px;border-radius:8px;font-style:italic;">"${message}"</p>` : ''}
    <p style="font-size:14px;color:#666;">Order #${orderId}</p>
    ${itemsTable(stripeRows(items))}
    <p style="font-size:18px;font-weight:600;">Total: ฿${total}</p>
    <p style="margin-top:24px;font-size:13px;color:#888;">You will receive shipping updates once the order is dispatched.</p>`);
}

export function shippingNotificationHtml(order: Order): string {
  const orderId = order.sessionId.slice(-8).toUpperCase();
  const carrier = order.trackingCarrier?.trim();
  const rows = order.items
    .map(
      (li) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${li.description}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${li.quantity}</td>
        </tr>`
    )
    .join('');

  return layout(`
    <h2 style="color:#3D2410;">Your order is on its way! 🚚</h2>
    <p>Hi ${order.customerName ?? 'there'},</p>
    <p>Good news — your GingerBros order has shipped. Because this is a living, unpasteurized brew, please refrigerate it as soon as it arrives.</p>
    <div style="background:#F5F0EB;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:0 0 4px 0;font-size:14px;"><strong>Order:</strong> #${orderId}</p>
      <p style="margin:0 0 4px 0;font-size:14px;"><strong>Tracking number:</strong> ${order.trackingNumber}</p>
      ${carrier ? `<p style="margin:0;font-size:14px;"><strong>Carrier:</strong> ${carrier}</p>` : ''}
    </div>
    ${itemsTable(rows, false)}
    <p style="font-size:14px;">Track your order anytime at <a href="https://gingerbrosshop.com/track" style="color:#C0532B;">gingerbrosshop.com/track</a> using your email and order number <strong>${orderId}</strong>.</p>
    <p style="margin-top:24px;font-size:13px;color:#888;">Questions? Just reply to this email.</p>`);
}

export function welcomeHtml(): string {
  return layout(`
    <h2 style="color:#3D2410;">Welcome to the Brew Crew!</h2>
    <p>Thanks for subscribing. You'll be the first to hear about new flavors, exclusive offers, and ginger fizz tips.</p>
    <p style="margin-top:24px;font-size:13px;color:#888;">Brewed with patience in Thailand.<br>GingerBros</p>`);
}

export function abandonedCartHtml(snapshot: CartSnapshot): string {
  const rows = snapshot.items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">฿${item.price * item.quantity}</td></tr>`
    )
    .join('');

  return layout(`
    <h2 style="color:#3D2410;">Your cart is waiting!</h2>
    <p>Hi there,</p>
    <p>You left these items in your cart. Complete your order while they are still in stock.</p>
    ${itemsTable(rows)}
    <p style="font-size:18px;font-weight:600;">Subtotal: ฿${snapshot.subtotal}</p>
    <a href="${snapshot.url}" style="display:inline-block;margin-top:16px;background:#3D2410;color:#FDF8F0;font-family:system-ui,sans-serif;font-size:14px;font-weight:500;padding:12px 24px;border-radius:999px;text-decoration:none;">Complete My Order</a>
    <p style="margin-top:24px;font-size:13px;color:#888;">Free shipping on orders over ฿500.</p>`);
}
