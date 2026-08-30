import Stripe from 'stripe';
import { Resend } from 'resend';
import type { SessionWithShipping } from './stripe.js';
import type { Order } from './orders.js';
import type { CartSnapshot } from './carts.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const resendApiKey = process.env.RESEND_API_KEY;

export const FROM_EMAIL = process.env.FROM_EMAIL ?? 'orders@gingerbrosshop.com';
export const FROM_EMAIL_NEWSLETTER = 'hello@gingerbrosshop.com';
export const SELLER_EMAIL = process.env.SELLER_EMAIL;

// gingerbrosshop.com can't receive mail yet (Resend inbound is off, no MX
// records), so customer replies to order emails are routed here instead.
export const SUPPORT_REPLY_TO = process.env.SUPPORT_REPLY_TO ?? 'gingerbros.brew@gmail.com';

let resendClient: Resend | null | undefined;

export function getResend(): Resend | null {
  if (resendClient === undefined) {
    resendClient = resendApiKey ? new Resend(resendApiKey) : null;
  }
  return resendClient;
}

export const MAIL_FROM = `GingerBros <${FROM_EMAIL}>`;
export const MAIL_FROM_NEWSLETTER = `GingerBros <${FROM_EMAIL_NEWSLETTER}>`;

// Standard List-Unsubscribe headers for newsletter sends
export const UNSUBSCRIBE_HEADERS = {
  'List-Unsubscribe': `<mailto:${FROM_EMAIL_NEWSLETTER}?subject=Unsubscribe>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
};

// ---------------------------------------------------------------------------
// Brand
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
  muted: '#A07850',
};

const LOGO_URL = 'https://gingerbrosshop.com/images/logo-email.png';
const BOTTLE_URL = 'https://gingerbrosshop.com/images/ginger-fizz-new.png';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function money(minor: number | null | undefined): string {
  return ((minor ?? 0) / 100).toLocaleString();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// ---------------------------------------------------------------------------
// Layout — shared wrapper for every email
// ---------------------------------------------------------------------------

function layout(inner: string, preheader = ''): string {
  // Preheader filler prevents Gmail from pulling in body text as preview
  const preheaderFiller = '‌ '.repeat(60);
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:transparent;opacity:0;">${preheader} ${preheaderFiller}</div>`
    : '';

  return `<div style="background:${BRAND.cream};margin:0;padding:32px 12px 40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND.brown};">
  ${preheaderHtml}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:${BRAND.brown};border-radius:20px 20px 0 0;padding:30px 32px 26px;text-align:center;">
            <img src="${LOGO_URL}" width="54" height="54" alt="GingerBros" style="border-radius:13px;display:block;margin:0 auto 14px;border:0;" />
            <div style="color:${BRAND.cream};font-size:21px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;line-height:1;">GingerBros</div>
            <div style="color:${BRAND.amber};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;margin-top:5px;font-weight:600;">Naturally Brewed · Bangkok, Thailand</div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 32px;">
            ${inner}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${BRAND.brown};border-radius:0 0 20px 20px;padding:22px 32px;text-align:center;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding-bottom:12px;">
                  <a href="https://www.instagram.com/drinkgingerbros" style="color:${BRAND.amber};text-decoration:none;font-size:12px;font-weight:600;margin:0 6px;">Instagram</a>
                  <span style="color:${BRAND.earth};font-size:12px;">&nbsp;·&nbsp;</span>
                  <a href="https://www.tiktok.com/@gingerbrosbrew" style="color:${BRAND.amber};text-decoration:none;font-size:12px;font-weight:600;margin:0 6px;">TikTok</a>
                  <span style="color:${BRAND.earth};font-size:12px;">&nbsp;·&nbsp;</span>
                  <a href="https://gingerbrosshop.com" style="color:${BRAND.amber};text-decoration:none;font-size:12px;font-weight:600;margin:0 6px;">gingerbrosshop.com</a>
                </td>
              </tr>
              <tr>
                <td align="center" style="color:${BRAND.muted};font-size:11px;line-height:1.7;">
                  Brewed and bottled in Thailand 🇹🇭<br>
                  <a href="mailto:${FROM_EMAIL_NEWSLETTER}?subject=Unsubscribe&body=Please%20remove%20me%20from%20the%20GingerBros%20mailing%20list." style="color:${BRAND.muted};text-decoration:underline;font-size:11px;">Unsubscribe</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</div>`;
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;color:${BRAND.brown};font-size:24px;font-weight:800;line-height:1.25;">${text}</h1>`;
}

function body(text: string, style = ''): string {
  return `<p style="margin:0 0 16px;color:${BRAND.earth};font-size:15px;line-height:1.65;${style}">${text}</p>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.amber};color:${BRAND.brown};font-size:14px;font-weight:800;letter-spacing:0.05em;padding:14px 30px;border-radius:999px;text-decoration:none;border:0;">${label}</a>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="border-top:1px solid ${BRAND.line};"></td></tr></table>`;
}

function itemsTable(rows: string, totals = true): string {
  const header = totals
    ? `<tr style="background:${BRAND.warmWhite};"><th style="padding:10px 8px;text-align:left;color:${BRAND.earth};font-size:11px;text-transform:uppercase;letter-spacing:0.07em;font-weight:700;">Item</th><th style="padding:10px 8px;text-align:center;color:${BRAND.earth};font-size:11px;text-transform:uppercase;letter-spacing:0.07em;font-weight:700;">Qty</th><th style="padding:10px 8px;text-align:right;color:${BRAND.earth};font-size:11px;text-transform:uppercase;letter-spacing:0.07em;font-weight:700;">Total</th></tr>`
    : `<tr style="background:${BRAND.warmWhite};"><th style="padding:10px 8px;text-align:left;color:${BRAND.earth};font-size:11px;text-transform:uppercase;letter-spacing:0.07em;font-weight:700;">Item</th><th style="padding:10px 8px;text-align:center;color:${BRAND.earth};font-size:11px;text-transform:uppercase;letter-spacing:0.07em;font-weight:700;">Qty</th></tr>`;
  return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;border-radius:10px;overflow:hidden;"><thead>${header}</thead><tbody>${rows}</tbody></table>`;
}

function totalLine(total: string, suffix = ''): string {
  return `<p style="text-align:right;font-size:18px;font-weight:800;color:${BRAND.brown};margin:8px 0 0;">Total: ฿${total}<span style="font-size:13px;font-weight:500;color:${BRAND.rust};">${suffix}</span></p>`;
}

function stripeRows(items: Stripe.LineItem[]): string {
  return items
    .map(
      (li) =>
        `<tr>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};color:${BRAND.brown};font-size:14px;">${li.description}</td>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};text-align:center;color:${BRAND.earth};font-size:14px;">${li.quantity}</td>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};text-align:right;color:${BRAND.brown};font-size:14px;font-weight:600;">฿${money(li.amount_total)}</td>
        </tr>`
    )
    .join('');
}

function infoCard(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr><td style="background:${BRAND.warmWhite};border:1px solid ${BRAND.line};padding:16px 18px;border-radius:12px;">${inner}</td></tr></table>`;
}

// ---------------------------------------------------------------------------
// Code / promo display box — big, dashed border, amber accent
// ---------------------------------------------------------------------------

function codeBox(title: string, code: string, subtitle: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td style="background:${BRAND.cream};border:2px dashed ${BRAND.amber};border-radius:18px;padding:28px 24px;text-align:center;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:${BRAND.rust};font-weight:700;margin-bottom:14px;">${title}</div>
        <div style="font-size:44px;font-weight:800;letter-spacing:0.22em;color:${BRAND.brown};font-family:'Courier New',Courier,monospace;line-height:1;">${code}</div>
        <div style="font-size:11px;color:${BRAND.earth};margin-top:14px;letter-spacing:0.04em;">${subtitle}</div>
      </td>
    </tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function sellerNotificationHtml(session: SessionWithShipping, items: Stripe.LineItem[], orderNote?: string): string {
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
        `<p style="margin:0 0 4px;font-weight:700;color:${BRAND.brown};">🎁 This order is a gift</p>
         <p style="margin:0;font-size:14px;color:${BRAND.earth};"><strong>Recipient:</strong> ${recipientName ?? '—'}</p>
         <p style="margin:0;font-size:14px;color:${BRAND.earth};"><strong>Recipient email:</strong> ${recipientEmail ?? '—'}</p>
         ${giftMessage ? `<p style="margin:8px 0 0;font-size:14px;font-style:italic;color:${BRAND.earth};">"${giftMessage}"</p>` : ''}`
      )
    : '';

  const adminBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gingerbrosshop.com';
  const noteHtml = orderNote?.trim()
    ? infoCard(`<p style="margin:0 0 4px;font-weight:700;color:${BRAND.brown};">📝 Order note</p><p style="margin:0;white-space:pre-wrap;color:${BRAND.earth};">${escapeHtml(orderNote)}</p>`)
    : '';

  return layout(
    `${heading('New order received 🍺')}
    ${body(`Order <strong>#${orderId}</strong> has been paid${interval ? ` — <strong>Subscription (every ${interval})</strong>` : ''}.`)}
    ${contactHtml}
    ${itemsTable(stripeRows(items))}
    ${totalLine(total, interval ? `/${interval}` : '')}
    ${giftHtml}
    ${noteHtml}
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
    `${heading('Order confirmed. 🍺')}
    ${body(`Hi ${session.customer_details?.name ?? 'there'},`)}
    ${body(`We have your order and will send tracking details as soon as it ships. Because it's a fresh, naturally fermented brew, please refrigerate it immediately on arrival.`)}
    <p style="font-size:13px;color:${BRAND.rust};font-weight:700;margin:16px 0 4px;letter-spacing:0.04em;">ORDER #${orderId}</p>
    ${itemsTable(stripeRows(items))}
    ${totalLine(total, interval ? `/${interval}` : '')}
    ${shippingHtml}
    ${interval ? `${divider()}<p style="margin:0;font-size:13px;color:${BRAND.earth};">This is a subscription billed every ${interval}. You can pause, skip, or cancel anytime from your customer portal.</p>` : ''}
    ${divider()}
    <p style="margin:0;font-size:13px;color:${BRAND.earth};">Questions? Just reply to this email — we're happy to help.</p>`,
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
    `${heading('You\'ve received a gift. 🎁')}
    ${body(`Hi ${recipientName ?? 'there'},`)}
    ${body(`<strong>${senderName}</strong> sent you a GingerBros gift — naturally fermented ginger fizz, brewed with patience in Bangkok.`)}
    ${message ? infoCard(`<p style="margin:0;font-style:italic;color:${BRAND.earth};">"${message}"</p>`) : ''}
    <p style="font-size:13px;color:${BRAND.rust};font-weight:700;margin:16px 0 4px;letter-spacing:0.04em;">ORDER #${orderId}</p>
    ${itemsTable(stripeRows(items))}
    ${totalLine(total)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:${BRAND.earth};">You'll receive shipping updates once the order is dispatched.</p>`,
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
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};color:${BRAND.brown};font-size:14px;">${li.description}</td>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};text-align:center;color:${BRAND.earth};font-size:14px;">${li.quantity}</td>
        </tr>`
    )
    .join('');

  return layout(
    `${heading('Your order is on its way. 🚚')}
    ${body(`Hi ${order.customerName ?? 'there'},`)}
    ${body(`Good news — your GingerBros is en route. It's a fresh, naturally fermented brew, so please refrigerate it as soon as it arrives.`)}
    ${infoCard(
      `<p style="margin:0 0 6px;font-size:14px;color:${BRAND.earth};"><strong style="color:${BRAND.brown};">Order:</strong> #${orderId}</p>
       <p style="margin:0 0 6px;font-size:14px;color:${BRAND.earth};"><strong style="color:${BRAND.brown};">Tracking:</strong> ${order.trackingNumber}</p>
       ${carrier ? `<p style="margin:0;font-size:14px;color:${BRAND.earth};"><strong style="color:${BRAND.brown};">Carrier:</strong> ${carrier}</p>` : ''}`
    )}
    ${itemsTable(rows, false)}
    <p style="margin-top:8px;text-align:center;">${button('Track My Order →', 'https://gingerbrosshop.com/track')}</p>
    ${divider()}
    <p style="margin:0;font-size:13px;color:${BRAND.earth};">Track anytime at gingerbrosshop.com/track with your email and order number <strong>${orderId}</strong>.</p>`,
    `Your GingerBros order #${orderId} has shipped`
  );
}

export interface WholesaleInquiry {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  message: string;
}

export function wholesaleInquiryHtml(inquiry: WholesaleInquiry): string {
  const businessName = escapeHtml(inquiry.businessName);
  const contactName = escapeHtml(inquiry.contactName);
  const email = escapeHtml(inquiry.email);
  const phone = inquiry.phone ? escapeHtml(inquiry.phone) : '';
  const message = escapeHtml(inquiry.message);

  return layout(
    `${heading('New wholesale inquiry 🏪')}
    ${body(`<strong>Business:</strong> ${businessName}`)}
    ${body(`<strong>Contact:</strong> ${contactName} · ${email}${phone ? ` · ${phone}` : ''}`)}
    ${infoCard(`<p style="margin:0;white-space:pre-wrap;color:${BRAND.earth};">${message}</p>`)}
    <p style="margin-top:24px;text-align:center;">${button('Reply →', `mailto:${inquiry.email}`)}</p>`,
    `Wholesale inquiry from ${businessName}`
  );
}

export function wholesaleConfirmationHtml(inquiry: WholesaleInquiry): string {
  return layout(
    `${heading('Got your inquiry. 🍺')}
    ${body(`We've received your wholesale inquiry for <strong>${escapeHtml(inquiry.businessName)}</strong> and will come back with trade pricing and delivery options within 24 hours.`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:${BRAND.earth};">Questions in the meantime? Just reply to this email.</p>`,
    'We got your wholesale inquiry'
  );
}

// ---------------------------------------------------------------------------
// Newsletter / subscriber emails
// ---------------------------------------------------------------------------

/**
 * Sent immediately on subscribe. Contains the 6-digit OTP to verify email
 * and unlock 10% off.
 */
export function welcomeWithCodeHtml(code: string): string {
  const display = `${code.slice(0, 3)}&nbsp;${code.slice(3)}`;
  return layout(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td>
          <img src="${BOTTLE_URL}" width="488" alt="GingerBros Ginger Fizz" style="width:100%;max-width:488px;border-radius:14px;display:block;border:0;" />
        </td>
      </tr>
    </table>

    ${heading('You\'re in. 🫚')}
    ${body('New drops, restocks, and offers — you\'ll hear about them before anyone else.')}
    ${body('Enter this code back on the site to claim <strong>10% off your first order</strong>:')}

    ${codeBox('Verification Code', display, 'Valid for 24 hours &nbsp;·&nbsp; One use only')}

    <p style="margin:0 0 24px;text-align:center;">${button('Go claim your 10% off →', 'https://gingerbrosshop.com/#newsletter')}</p>

    ${divider()}
    <p style="margin:0;font-size:12px;color:${BRAND.muted};text-align:center;">Didn't sign up? You can safely ignore this email.</p>`,
    'Your code is inside — 10% off waiting for you'
  );
}

/**
 * Sent after the subscriber successfully verifies their code.
 * Contains a unique single-use Stripe promo code.
 */
export function discountCodeHtml(promoCode: string): string {
  return layout(
    `${heading('Here\'s your 10% off. 🎉')}
    ${body('Thanks for verifying. Use this code at checkout on your first order:')}

    ${codeBox('Your Promo Code', promoCode, '10% off your first order &nbsp;·&nbsp; Expires in 24 hours &nbsp;·&nbsp; One use only')}

    <p style="margin:0 0 8px;color:${BRAND.earth};font-size:14px;">Enter it at checkout — it comes off your total automatically.</p>
    ${body('And while you\'re here, the Ginger Fizz is the one to start with. Fresh, strong, and actually good for you.', `font-size:14px;`)}

    <p style="margin:24px 0 0;text-align:center;">${button('Shop Now →', 'https://gingerbrosshop.com/#shop')}</p>`,
    `Your 10% off code — ${promoCode}`
  );
}

/**
 * Legacy plain welcome email (kept for non-verification fallback path).
 */
export function welcomeHtml(): string {
  return layout(
    `${heading('You\'re in. 🫚')}
    ${body('New drops, restocks, and offers — you\'ll hear about them before anyone else.')}
    <p style="margin:24px 0 0;text-align:center;">${button('Shop the Brews →', 'https://gingerbrosshop.com/#shop')}</p>`,
    'Welcome to GingerBros'
  );
}

// ---------------------------------------------------------------------------
// Loyalty / reward emails
// ---------------------------------------------------------------------------

export function boxReturnRewardHtml(amountBaht: number, code?: string | null): string {
  const redeemContent = code
    ? codeBox('Your Reward Code', code, `฿${amountBaht} off your next order`)
    : `<p style="margin:0;color:${BRAND.earth};font-size:14px;">It's already saved to your email — check out with this address and your ฿${amountBaht} comes off automatically. No code needed. ✨</p>`;

  return layout(
    `${heading('Thanks for returning your box. ♻️')}
    ${body(`You're helping us cut waste and keep every brew fresh — so here's <strong>฿${amountBaht} off your next order</strong> as a thank-you.`)}
    ${code ? redeemContent : infoCard(redeemContent)}
    <p style="margin-top:20px;text-align:center;">${button('Order Your Next Brew →', 'https://gingerbrosshop.com/#shop')}</p>
    ${divider()}
    <p style="margin:0;font-size:13px;color:${BRAND.earth};">Keep the foam boxes coming back and the rewards keep flowing.</p>`,
    `Your ฿${amountBaht} box-return reward is ready`
  );
}

export function backInStockHtml(productName: string, productUrl: string): string {
  return layout(
    `${heading('Good news — it\'s back. 🎉')}
    ${body(`<strong>${escapeHtml(productName)}</strong> is available again.`)}
    ${body(`We can't hold it for you, so grab yours before it sells out again.`, `font-size:14px;`)}
    <p style="margin-top:24px;text-align:center;">${button('Shop Now →', productUrl)}</p>`,
    `${productName} is back in stock`
  );
}

export function trackingInfoEmailHtml(order: Order): string {
  const orderId = order.sessionId.slice(-8).toUpperCase();
  const carrier = order.trackingCarrier?.trim();
  const hasTracking = !!order.trackingNumber;

  const rows = order.items
    .map(
      (li) =>
        `<tr>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};color:${BRAND.brown};font-size:14px;">${li.description}</td>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};text-align:center;color:${BRAND.earth};font-size:14px;">${li.quantity}</td>
        </tr>`
    )
    .join('');

  const trackingInfo = hasTracking
    ? infoCard(
        `<p style="margin:0 0 6px;font-size:14px;color:${BRAND.earth};"><strong style="color:${BRAND.brown};">Order:</strong> #${orderId}</p>
         <p style="margin:0 0 6px;font-size:14px;color:${BRAND.earth};"><strong style="color:${BRAND.brown};">Tracking:</strong> ${order.trackingNumber}</p>
         ${carrier ? `<p style="margin:0;font-size:14px;color:${BRAND.earth};"><strong style="color:${BRAND.brown};">Carrier:</strong> ${carrier}</p>` : ''}`
      )
    : infoCard(
        `<p style="margin:0;font-size:14px;color:${BRAND.earth};">Your order <strong>#${orderId}</strong> is confirmed and being prepared for shipment. You will receive another email with tracking details once it ships.</p>`
      );

  return layout(
    `${heading('Your order status. 🍺')}
    ${body(`Hi ${order.customerName ?? 'there'},`)}
    ${body(`Here is the latest update on your GingerBros order:`)}
    ${trackingInfo}
    ${itemsTable(rows, false)}
    <p style="margin-top:8px;text-align:center;">${button('Track My Order →', 'https://gingerbrosshop.com/track')}</p>
    ${divider()}
    <p style="margin:0;font-size:13px;color:${BRAND.earth};">Track anytime at gingerbrosshop.com/track with your email and order number <strong>${orderId}</strong>.</p>`,
    `Your GingerBros order #${orderId} status`
  );
}

export function abandonedCartHtml(snapshot: CartSnapshot): string {
  const rows = snapshot.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};color:${BRAND.brown};font-size:14px;">${item.name}</td>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};text-align:center;color:${BRAND.earth};font-size:14px;">${item.quantity}</td>
          <td style="padding:11px 8px;border-bottom:1px solid ${BRAND.line};text-align:right;color:${BRAND.brown};font-size:14px;font-weight:600;">฿${item.price * item.quantity}</td>
        </tr>`
    )
    .join('');

  return layout(
    `${heading('You left something brewing. 🛒')}
    ${body('These are still in your cart. Complete your order while they\'re in stock:')}
    ${itemsTable(rows)}
    ${totalLine(String(snapshot.subtotal))}
    <p style="margin-top:16px;text-align:center;">${button('Complete My Order →', snapshot.url)}</p>
    ${divider()}
    <p style="margin:0;font-size:13px;color:${BRAND.earth};text-align:center;">Free shipping on orders over ฿500.</p>`,
    'You left something brewing in your cart'
  );
}
