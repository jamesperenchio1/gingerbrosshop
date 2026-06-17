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
// Brand tokens — kept in sync with tailwind.config.js so emails feel like the
// rest of the storefront.
// ---------------------------------------------------------------------------

const BRAND = {
  brown: '#3D2410',
  earth: '#5C3D1E',
  rust: '#8B5A2B',
  amber: '#D4A34B',
  warmGold: '#C9963A',
  cream: '#F5E6C8',
  warmWhite: '#FDF8F0',
  green: '#6B8E4E',
  line: '#EADFC8',
};

// Hosted on the live site so it renders in every mail client without attachments.
const LOGO_URL = 'https://gingerbrosshop.com/icon-192.png';

// ---------------------------------------------------------------------------
// Shared presentation helpers
// ---------------------------------------------------------------------------

/** Format Stripe minor units (e.g. satang) as a grouped major-unit string. */
export function money(minor: number | null | undefined): string {
  return ((minor ?? 0) / 100).toLocaleString();
}

/**
 * Human label for the billing cadence of a subscription, derived from the
 * line items' price (e.g. "week", "2 weeks", "month"). Returns null when the
 * order has no recurring item, so callers can branch on it.
 */
function subscriptionInterval(items: Stripe.LineItem[]): string | null {
  for (const li of items) {
    const recurring = (li.price as Stripe.Price | null | undefined)?.recurring;
    if (recurring) {
      const { interval, interval_count } = recurring;
      return interval_count === 1 ? interval : `${interval_count} ${interval}s`;
    }
  }
  return null;
}

/** Brand-styled outer wrapper shared by every email body. */
function layout(inner: string, preheader = ''): string {
  return `<div style="background:${BRAND.warmWhite};margin:0;padding:24px 12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND.brown};">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(61,36,16,0.10);">
      <tr>
        <td style="background:${BRAND.brown};padding:26px 28px;text-align:center;">
          <img src="${LOGO_URL}" width="52" height="52" alt="GingerBros" style="border-radius:12px;display:block;margin:0 auto 8px;" />
          <div style="color:${BRAND.cream};font-size:20px;font-weight:700;letter-spacing:0.06em;">GINGERBROS</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">${inner}</td>
      </tr>
      <tr>
        <td style="background:${BRAND.cream};padding:18px 28px;text-align:center;color:${BRAND.earth};font-size:12px;line-height:1.6;">
          Raw, living ginger fizz · Brewed with patience in Thailand 🇹🇭<br>
          <a href="https://gingerbrosshop.com" style="color:${BRAND.rust};text-decoration:none;font-weight:600;">gingerbrosshop.com</a>
        </td>
      </tr>
    </table>
  </div>`;
}

/** A heading styled consistently across templates. */
function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;color:${BRAND.brown};font-size:22px;font-weight:700;">${text}</h1>`;
}

/** A pill-shaped call-to-action button. */
function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin:8px 0 4px;background:${BRAND.amber};color:${BRAND.brown};font-size:14px;font-weight:700;letter-spacing:0.04em;padding:13px 28px;border-radius:999px;text-decoration:none;">${label}</a>`;
}

/** An items table. `totals: false` drops the price column (e.g. shipping email). */
function itemsTable(rows: string, totals = true): string {
  const header = totals
    ? `<tr style="background:${BRAND.warmWhite};"><th style="padding:10px 8px;text-align:left;color:${BRAND.earth};font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Item</th><th style="padding:10px 8px;color:${BRAND.earth};font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Qty</th><th style="padding:10px 8px;text-align:right;color:${BRAND.earth};font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Total</th></tr>`
    : `<tr style="background:${BRAND.warmWhite};"><th style="padding:10px 8px;text-align:left;color:${BRAND.earth};font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Item</th><th style="padding:10px 8px;color:${BRAND.earth};font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Qty</th></tr>`;
  return `<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;"><thead>${header}</thead><tbody>${rows}</tbody></table>`;
}

/** A right-aligned total line. */
function totalLine(total: string, suffix = ''): string {
  return `<p style="text-align:right;font-size:18px;font-weight:700;color:${BRAND.brown};margin:8px 0 0;">Total: ฿${total}<span style="font-size:13px;font-weight:500;color:${BRAND.rust};">${suffix}</span></p>`;
}

function stripeRows(items: Stripe.LineItem[]): string {
  return items
    .map(
      (li) =>
        `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};">${li.description}</td>
          <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};text-align:center;">${li.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};text-align:right;">฿${money(li.amount_total)}</td>
        </tr>`
    )
    .join('');
}

/** Highlighted info card (gift note, tracking details, etc.). */
function infoCard(inner: string): string {
  return `<div style="background:${BRAND.warmWhite};border:1px solid ${BRAND.line};padding:14px 16px;border-radius:12px;margin:16px 0;">${inner}</div>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function sellerNotificationHtml(session: SessionWithShipping, items: Stripe.LineItem[]): string {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = money(session.amount_total);
  const interval = session.mode === 'subscription' ? subscriptionInterval(items) : null;

  const shipping = session.shipping_details;
  const shippingHtml = shipping
    ? `<p style="font-size:14px;color:${BRAND.earth};margin:16px 0 0;"><strong>Shipping to:</strong><br>${shipping.name}<br>${Object.values(shipping.address ?? {}).filter(Boolean).join(', ')}</p>`
    : '';

  const phone = session.customer_details?.phone;
  const contactHtml = `<p style="font-size:14px;color:${BRAND.earth};margin:4px 0 0;"><strong>Customer:</strong> ${session.customer_details?.name ?? '—'} · ${session.customer_details?.email ?? '—'}${phone ? ` · ${phone}` : ''}</p>`;

  const isGift = session.metadata?.isGift === 'true';
  const recipientName = session.metadata?.recipientName;
  const recipientEmail = session.metadata?.recipientEmail;
  const giftMessage = session.metadata?.giftMessage;
  const giftHtml = isGift
    ? infoCard(
        `<p style="margin:0 0 4px;font-weight:700;">🎁 This order is a gift</p>
         <p style="margin:0;font-size:14px;"><strong>Recipient:</strong> ${recipientName ?? '—'}</p>
         <p style="margin:0;font-size:14px;"><strong>Recipient email:</strong> ${recipientEmail ?? '—'}</p>
         ${giftMessage ? `<p style="margin:8px 0 0;font-size:14px;font-style:italic;">“${giftMessage}”</p>` : ''}`
      )
    : '';

  const adminBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gingerbrosshop.com';

  return layout(
    `${heading('New order received 🍺')}
    <p style="margin:0 0 4px;">Order <strong>#${orderId}</strong> has been paid${interval ? ` — <strong>Subscription (every ${interval})</strong>` : ''}.</p>
    ${contactHtml}
    ${itemsTable(stripeRows(items))}
    ${totalLine(total, interval ? `/${interval}` : '')}
    ${giftHtml}
    ${shippingHtml}
    <p style="margin-top:24px;text-align:center;">${button('Add Tracking →', `${adminBase}/admin/orders`)}</p>`,
    `New order #${orderId} — ฿${total}`
  );
}

export function customerInvoiceHtml(session: SessionWithShipping, items: Stripe.LineItem[]): string {
  const orderId = session.id.slice(-8).toUpperCase();
  const total = money(session.amount_total);
  const interval = session.mode === 'subscription' ? subscriptionInterval(items) : null;

  const shipping = session.shipping_details;
  const shippingHtml = shipping
    ? `<p style="color:${BRAND.earth};font-size:14px;margin:16px 0 0;"><strong>Shipping to:</strong><br>${shipping.name}<br>${Object.values(shipping.address ?? {}).filter(Boolean).join(', ')}</p>`
    : '';

  return layout(
    `${heading('Thank you for your order! 🍺')}
    <p style="margin:0 0 12px;">Hi ${session.customer_details?.name ?? 'there'},</p>
    <p style="margin:0 0 4px;">We've received your order and will send tracking details once your GingerBros ships. Because it's a living, unpasteurized brew, please refrigerate it as soon as it arrives.</p>
    <p style="font-size:14px;color:${BRAND.rust};font-weight:600;margin:12px 0 0;">Order #${orderId}</p>
    ${itemsTable(stripeRows(items))}
    ${totalLine(total, interval ? `/${interval}` : '')}
    ${shippingHtml}
    ${interval ? `<p style="margin-top:16px;font-size:13px;color:${BRAND.earth};">This is a subscription billed every ${interval}. You can pause, skip, or cancel anytime from your customer portal.</p>` : ''}
    <p style="margin-top:24px;font-size:13px;color:${BRAND.earth};">Questions? Just reply to this email — we're happy to help.</p>`,
    `Order #${orderId} confirmed — ฿${total}`
  );
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

  return layout(
    `${heading('You have received a gift! 🎁')}
    <p style="margin:0 0 12px;">Hi ${recipientName ?? 'there'},</p>
    <p style="margin:0 0 4px;"><strong>${senderName}</strong> has sent you a GingerBros gift — raw, living ginger fizz, brewed with patience.</p>
    ${message ? infoCard(`<p style="margin:0;font-style:italic;">"${message}"</p>`) : ''}
    <p style="font-size:14px;color:${BRAND.rust};font-weight:600;margin:12px 0 0;">Order #${orderId}</p>
    ${itemsTable(stripeRows(items))}
    ${totalLine(total)}
    <p style="margin-top:24px;font-size:13px;color:${BRAND.earth};">You'll receive shipping updates once the order is dispatched.</p>`,
    `${senderName} sent you a GingerBros gift`
  );
}

export function shippingNotificationHtml(order: Order): string {
  const orderId = order.sessionId.slice(-8).toUpperCase();
  const carrier = order.trackingCarrier?.trim();
  const rows = order.items
    .map(
      (li) =>
        `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};">${li.description}</td>
          <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};text-align:center;">${li.quantity}</td>
        </tr>`
    )
    .join('');

  return layout(
    `${heading('Your order is on its way! 🚚')}
    <p style="margin:0 0 12px;">Hi ${order.customerName ?? 'there'},</p>
    <p style="margin:0 0 4px;">Good news — your GingerBros order has shipped. Because this is a living, unpasteurized brew, please refrigerate it as soon as it arrives.</p>
    ${infoCard(
      `<p style="margin:0 0 4px;font-size:14px;"><strong>Order:</strong> #${orderId}</p>
       <p style="margin:0 0 4px;font-size:14px;"><strong>Tracking number:</strong> ${order.trackingNumber}</p>
       ${carrier ? `<p style="margin:0;font-size:14px;"><strong>Carrier:</strong> ${carrier}</p>` : ''}`
    )}
    ${itemsTable(rows, false)}
    <p style="margin-top:8px;text-align:center;">${button('Track My Order →', 'https://gingerbrosshop.com/track')}</p>
    <p style="font-size:13px;color:${BRAND.earth};margin-top:16px;">Track anytime at gingerbrosshop.com/track using your email and order number <strong>${orderId}</strong>.</p>`,
    `Your GingerBros order #${orderId} has shipped`
  );
}

export function welcomeHtml(): string {
  return layout(
    `${heading('Welcome to the Brew Crew! 🍺')}
    <p style="margin:0 0 4px;">Thanks for subscribing. You'll be the first to hear about new flavors, exclusive offers, and ginger fizz tips.</p>
    <p style="margin-top:24px;text-align:center;">${button('Shop the Brews →', 'https://gingerbrosshop.com/#shop')}</p>`,
    'Welcome to GingerBros'
  );
}

/**
 * Sent the moment we mark a customer's foam box as returned. `code` is the
 * optional fallback promo code (when there's no email-keyed credit to lean on);
 * otherwise we tell them it's already saved to their email and auto-applies.
 */
export function boxReturnRewardHtml(amountBaht: number, code?: string | null): string {
  const redeem = code
    ? `<p style="margin:0 0 6px;">Use this code at checkout:</p>
       <div style="text-align:center;margin:8px 0 4px;">
         <span style="display:inline-block;background:${BRAND.warmWhite};border:2px dashed ${BRAND.amber};border-radius:12px;padding:12px 22px;font-size:20px;font-weight:700;letter-spacing:0.12em;color:${BRAND.brown};">${code}</span>
       </div>`
    : `<p style="margin:0;">It's already saved to your email — just check out with this address and your ฿${amountBaht} comes off automatically. No code to type. ✨</p>`;

  return layout(
    `${heading('Thanks for returning your box! ♻️')}
    <p style="margin:0 0 12px;">You're helping us cut waste and keep every brew chilled and fresh — so here's <strong>฿${amountBaht} off your next order</strong> as a thank-you.</p>
    ${infoCard(redeem)}
    <p style="margin-top:20px;text-align:center;">${button('Order Your Next Brew →', 'https://gingerbrosshop.com/#shop')}</p>
    <p style="margin-top:16px;font-size:13px;color:${BRAND.earth};">Keep the foam boxes coming back and the rewards keep flowing. 🍺</p>`,
    `Your ฿${amountBaht} box-return reward is ready`
  );
}


export function abandonedCartHtml(snapshot: CartSnapshot): string {
  const rows = snapshot.items
    .map(
      (item) =>
        `<tr><td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};">${item.name}</td><td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};text-align:center;">${item.quantity}</td><td style="padding:10px 8px;border-bottom:1px solid ${BRAND.line};text-align:right;">฿${item.price * item.quantity}</td></tr>`
    )
    .join('');

  return layout(
    `${heading('Your cart is waiting! 🛒')}
    <p style="margin:0 0 12px;">Hi there,</p>
    <p style="margin:0 0 4px;">You left these items in your cart. Complete your order while they're still in stock.</p>
    ${itemsTable(rows)}
    ${totalLine(String(snapshot.subtotal))}
    <p style="margin-top:16px;text-align:center;">${button('Complete My Order →', snapshot.url)}</p>
    <p style="margin-top:20px;font-size:13px;color:${BRAND.earth};text-align:center;">Free shipping on orders over ฿500.</p>`,
    'You left something brewing in your cart'
  );
}
