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
//
// Structure adapted from Postmark's open-source transactional templates
// (MIT, https://github.com/ActiveCampaign/postmark-templates): single column,
// left-aligned copy, thin rules, bulletproof buttons, dark-mode support.
// ---------------------------------------------------------------------------

const BRAND = {
  brown: '#3D2410',
  text: '#4A3626',
  muted: '#8A7561',
  amber: '#D4A34B',
  cream: '#F5EFE3',
  panel: '#FAF5EA',
  line: '#E6DCC8',
};

const LOGO_URL = 'https://gingerbrosshop.com/images/logo-email.png';
const SITE_URL = 'https://gingerbrosshop.com';
const FONT = `'Helvetica Neue',Helvetica,Arial,sans-serif`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function money(minor: number | null | undefined): string {
  return ((minor ?? 0) / 100).toLocaleString('en-US');
}

function escapeHtml(text: string | null | undefined): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function firstName(name: string | null | undefined): string {
  const n = name?.trim();
  return n ? escapeHtml(n) : 'there';
}

function orderRef(sessionId: string): string {
  return sessionId.slice(-8).toUpperCase();
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

function addressLine(shipping: SessionWithShipping['shipping_details']): string {
  if (!shipping) return '';
  const parts = Object.values(shipping.address ?? {}).filter(Boolean) as string[];
  return `${escapeHtml(shipping.name)}<br>${parts.map(escapeHtml).join(', ')}`;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

interface LayoutOptions {
  /** Marketing mail gets an unsubscribe link; transactional mail does not. */
  marketing?: boolean;
  /** Set for internal (seller/admin) mail so the footer skips customer copy. */
  internal?: boolean;
}

function layout(inner: string, preheader: string, title: string, opts: LayoutOptions = {}): string {
  const filler = '&#8204;&nbsp;'.repeat(60);
  const footer = opts.internal
    ? `GingerBros internal notification`
    : opts.marketing
      ? `You're getting this because you signed up at gingerbrosshop.com.<br><a href="mailto:${FROM_EMAIL_NEWSLETTER}?subject=Unsubscribe&amp;body=Please%20remove%20me%20from%20the%20GingerBros%20mailing%20list." style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a>`
      : `Questions about your order? Reply to this email.`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escapeHtml(title)}</title>
<style type="text/css">
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:none; }
  a { color:${BRAND.brown}; }
  @media only screen and (max-width:600px) {
    .inner { width:100% !important; }
    .cell { padding:28px 22px !important; }
  }
  @media (prefers-color-scheme: dark) {
    body, .wrap { background-color:#1B120B !important; }
    .inner, .cell { background-color:#2A1D13 !important; }
    .head { background-color:#120C07 !important; }
    p, h1, h2, td, span, strong, li { color:#F1E7D6 !important; }
    .muted, .muted a { color:#A99783 !important; }
    .panel { background-color:#35261A !important; border-color:#4A3626 !important; }
    .rule { border-color:#4A3626 !important; }
    .btn { background-color:#D4A34B !important; color:#2A1D13 !important; }
  }
</style>
<!--[if mso]><style type="text/css">td,p,h1,a{font-family:Arial,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:${FONT};color:${BRAND.text};">
<div style="display:none;visibility:hidden;mso-hide:all;max-height:0;max-width:0;overflow:hidden;font-size:1px;line-height:1px;color:${BRAND.cream};opacity:0;">${escapeHtml(preheader)} ${filler}</div>
<table role="presentation" class="wrap" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.cream};">
  <tr><td align="center" style="padding:24px 12px 32px;">
    <table role="presentation" class="inner" width="570" cellpadding="0" cellspacing="0" border="0" style="width:570px;max-width:570px;">
      <tr>
        <td class="head" style="background:${BRAND.brown};padding:16px 28px;">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${LOGO_URL}" width="40" height="40" alt="" style="display:inline-block;vertical-align:middle;border:0;border-radius:50%;" />
            <span style="display:inline-block;vertical-align:middle;margin-left:10px;color:${BRAND.cream};font-family:${FONT};font-size:17px;font-weight:700;letter-spacing:0.02em;">GingerBros</span>
          </a>
        </td>
      </tr>
      <tr>
        <td class="cell" style="background:#ffffff;padding:40px 40px 36px;font-family:${FONT};">
          ${inner}
        </td>
      </tr>
      <tr>
        <td class="muted" style="padding:20px 8px 0;text-align:center;font-family:${FONT};font-size:12px;line-height:1.7;color:${BRAND.muted};">
          ${footer}<br>
          GingerBros &middot; Bangkok, Thailand &middot; <a href="${SITE_URL}" style="color:${BRAND.muted};">gingerbrosshop.com</a>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;color:${BRAND.brown};font-family:${FONT};font-size:22px;font-weight:700;line-height:1.3;text-align:left;">${text}</h1>`;
}

function body(text: string, style = ''): string {
  return `<p style="margin:0 0 16px;color:${BRAND.text};font-family:${FONT};font-size:16px;line-height:1.6;${style}">${text}</p>`;
}

function small(text: string): string {
  return `<p class="muted" style="margin:0;color:${BRAND.muted};font-family:${FONT};font-size:13px;line-height:1.6;">${text}</p>`;
}

/** Bulletproof button (padding lives on the anchor, works in Outlook). */
function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;"><tr><td>
    <a href="${escapeHtml(href)}" class="btn" target="_blank" style="display:inline-block;background:${BRAND.amber};color:${BRAND.brown};font-family:${FONT};font-size:15px;font-weight:700;text-decoration:none;border-radius:4px;border:solid ${BRAND.amber};border-width:12px 24px;">${label}</a>
  </td></tr></table>`;
}

function rule(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 20px;"><tr><td class="rule" style="border-top:1px solid ${BRAND.line};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function panel(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;"><tr><td class="panel" style="background:${BRAND.panel};border:1px solid ${BRAND.line};padding:16px 18px;font-family:${FONT};font-size:15px;line-height:1.6;color:${BRAND.text};">${inner}</td></tr></table>`;
}

/** Label / value pairs, one per line. Values must already be escaped. */
function details(pairs: Array<[string, string | null | undefined]>): string {
  return pairs
    .filter(([, v]) => v)
    .map(([k, v]) => `<span class="muted" style="color:${BRAND.muted};">${k}</span>&nbsp; ${v}`)
    .join('<br>');
}

interface Row {
  description: string;
  quantity: number | null;
  /** Pre-formatted price string; omit for quantity-only tables. */
  amount?: string;
  /** Optional thumbnail URL (absolute, or a site-relative path). */
  image?: string;
}

function imageUrl(src: string | undefined): string {
  if (!src) return `${SITE_URL}/images/ginger-fizz-new.png`;
  return /^https?:\/\//i.test(src) ? src : `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

function itemsTable(rows: Row[], total?: string): string {
  const withAmount = rows.some((r) => r.amount !== undefined);
  const th = (label: string, align: string) =>
    `<th align="${align}" class="rule" style="padding:0 0 8px;border-bottom:1px solid ${BRAND.line};font-family:${FONT};font-size:12px;font-weight:400;color:${BRAND.muted};text-align:${align};">${label}</th>`;
  const td = (v: string, align = 'left') =>
    `<td align="${align}" class="rule" style="padding:11px 0;border-bottom:1px solid ${BRAND.line};font-family:${FONT};font-size:15px;color:${BRAND.text};text-align:${align};">${v}</td>`;

  const body = rows
    .map((r) => {
      const desc = r.image
        ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 12px 0 0;"><img src="${escapeHtml(imageUrl(r.image))}" width="56" height="56" alt="${escapeHtml(r.description)}" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:6px;border:0;background:${BRAND.cream};" /></td><td style="font-family:${FONT};font-size:15px;color:${BRAND.text};">${escapeHtml(r.description)}</td></tr></table>`
        : escapeHtml(r.description);
      return `<tr>${td(desc)}${td(`<span style="white-space:nowrap;">× ${r.quantity ?? 1}</span>`, 'center')}${withAmount ? td(r.amount ?? '', 'right') : ''}</tr>`;
    })
    .join('');
  const totalRow = total
    ? `<tr><td colspan="2" style="padding:14px 0 0;font-family:${FONT};font-size:15px;font-weight:700;color:${BRAND.brown};">Total</td><td align="right" style="padding:14px 0 0;font-family:${FONT};font-size:15px;font-weight:700;color:${BRAND.brown};text-align:right;">${total}</td></tr>`
    : '';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
    <tr>${th('Item', 'left')}${th('Qty', 'center')}${withAmount ? th('Amount', 'right') : ''}</tr>
    ${body}${totalRow}
  </table>`;
}

function stripeRows(items: Stripe.LineItem[]): Row[] {
  return items.map((li) => ({
    description: li.description ?? '',
    quantity: li.quantity,
    amount: `฿${money(li.amount_total)}`,
  }));
}

function plainRows(items: Array<{ description: string; quantity: number | null }>): Row[] {
  return items.map((li) => ({ description: li.description, quantity: li.quantity }));
}

/** Large monospace code, used for OTPs and promo codes. */
function codeBox(code: string, note: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;"><tr>
    <td class="panel" align="center" style="background:${BRAND.panel};border:1px solid ${BRAND.line};padding:24px 16px;">
      <div style="font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:0.16em;color:${BRAND.brown};line-height:1.1;">${code}</div>
      <div class="muted" style="font-family:${FONT};font-size:13px;color:${BRAND.muted};margin-top:10px;">${note}</div>
    </td>
  </tr></table>`;
}

// ---------------------------------------------------------------------------
// Order emails
// ---------------------------------------------------------------------------

export function sellerNotificationHtml(session: SessionWithShipping, items: Stripe.LineItem[], orderNote?: string): string {
  const orderId = orderRef(session.id);
  const total = money(session.amount_total);
  const interval = session.mode === 'subscription' ? subscriptionInterval(items) : null;
  const cd = session.customer_details;

  const isGift = session.metadata?.isGift === 'true';
  const giftMessage = session.metadata?.giftMessage;
  const giftHtml = isGift
    ? panel(
        `<strong>Gift order</strong><br>${details([
          ['Recipient', escapeHtml(session.metadata?.recipientName)],
          ['Recipient email', escapeHtml(session.metadata?.recipientEmail)],
        ])}${giftMessage ? `<br><em>&ldquo;${escapeHtml(giftMessage)}&rdquo;</em>` : ''}`
      )
    : '';
  const noteHtml = orderNote?.trim()
    ? panel(`<strong>Order note</strong><br><span style="white-space:pre-wrap;">${escapeHtml(orderNote)}</span>`)
    : '';
  const shipHtml = session.shipping_details
    ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:${BRAND.text};"><strong>Ship to</strong><br>${addressLine(session.shipping_details)}</p>`
    : '';

  const adminBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : SITE_URL;

  return layout(
    `${heading(`New order #${orderId}`)}
    ${body(
      `${escapeHtml(cd?.name ?? 'A customer')} paid ฿${total}${interval ? ` for a subscription billed every ${escapeHtml(interval)}` : ''}.`
    )}
    ${panel(details([['Email', escapeHtml(cd?.email)], ['Phone', escapeHtml(cd?.phone)]]))}
    ${itemsTable(stripeRows(items), `฿${total}${interval ? ` / ${escapeHtml(interval)}` : ''}`)}
    ${giftHtml}${noteHtml}${shipHtml}
    ${button('Add tracking', `${adminBase}/admin/orders`)}`,
    `฿${total} from ${cd?.name ?? 'a customer'}`,
    `New order #${orderId}`,
    { internal: true }
  );
}

export function customerInvoiceHtml(session: SessionWithShipping, items: Stripe.LineItem[]): string {
  const orderId = orderRef(session.id);
  const total = money(session.amount_total);
  const interval = session.mode === 'subscription' ? subscriptionInterval(items) : null;

  return layout(
    `${heading(`Thanks for your order, ${firstName(session.customer_details?.name)}`)}
    ${body(`We've received order <strong>#${orderId}</strong> and will email you a tracking number when it ships.`)}
    ${body(`For the best experience, put it in the fridge as soon as it arrives.`)}
    ${itemsTable(stripeRows(items), `฿${total}${interval ? ` / ${escapeHtml(interval)}` : ''}`)}
    ${
      session.shipping_details
        ? `<p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:${BRAND.text};"><strong>Shipping to</strong><br>${addressLine(session.shipping_details)}</p>`
        : ''
    }
    ${
      interval
        ? `${rule()}${small(`This is a subscription billed every ${escapeHtml(interval)}. You can pause, skip or cancel from your customer portal.`)}`
        : ''
    }`,
    `Order #${orderId}, ฿${total}`,
    `Order #${orderId} confirmation`
  );
}

export function giftEmailHtml(
  session: SessionWithShipping,
  items: Stripe.LineItem[],
  recipientName: string | null,
  message: string | null,
  senderName: string
): string {
  const orderId = orderRef(session.id);
  const sender = escapeHtml(senderName);

  return layout(
    `${heading(`${sender} sent you a gift`)}
    ${body(`Hi ${firstName(recipientName)}, ${sender} ordered GingerBros ginger fizz for you. It ships to you directly and you'll get tracking details by email.`)}
    ${message ? panel(`<em>&ldquo;${escapeHtml(message)}&rdquo;</em><br><span class="muted" style="color:${BRAND.muted};">${sender}</span>`) : ''}
    ${itemsTable(plainRows(items.map((li) => ({ description: li.description ?? '', quantity: li.quantity }))))}
    ${rule()}
    ${small(`Order #${orderId}. For the best experience, put it in the fridge as soon as it arrives.`)}`,
    `${senderName} ordered you GingerBros ginger fizz`,
    `A gift from ${senderName}`
  );
}

export function shippingNotificationHtml(order: Order): string {
  const orderId = orderRef(order.sessionId);
  const carrier = order.trackingCarrier?.trim();

  return layout(
    `${heading(`Order #${orderId} has shipped`)}
    ${body(`Hi ${firstName(order.customerName)}, your order is on its way. Keep it refrigerated once it arrives.`)}
    ${panel(details([['Tracking', escapeHtml(order.trackingNumber)], ['Carrier', escapeHtml(carrier)]]))}
    ${itemsTable(plainRows(order.items))}
    ${button('Track your order', `${SITE_URL}/track`)}
    ${small(`On the tracking page, enter your email and order number ${orderId}.`)}`,
    `Order #${orderId} is on its way`,
    `Order #${orderId} has shipped`
  );
}

export function trackingInfoEmailHtml(order: Order): string {
  const orderId = orderRef(order.sessionId);
  const carrier = order.trackingCarrier?.trim();
  const hasTracking = !!order.trackingNumber;

  return layout(
    `${heading(`Order #${orderId} status`)}
    ${body(`Hi ${firstName(order.customerName)},`)}
    ${
      hasTracking
        ? panel(details([['Tracking', escapeHtml(order.trackingNumber)], ['Carrier', escapeHtml(carrier)]]))
        : body(`Your order is paid and being prepared. We'll email you again when it ships.`)
    }
    ${itemsTable(plainRows(order.items))}
    ${button('Track your order', `${SITE_URL}/track`)}
    ${small(`On the tracking page, enter your email and order number ${orderId}.`)}`,
    `Order #${orderId} status`,
    `Order #${orderId} status`
  );
}

// ---------------------------------------------------------------------------
// Wholesale
// ---------------------------------------------------------------------------

export interface WholesaleInquiry {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  message: string;
}

export function wholesaleInquiryHtml(inquiry: WholesaleInquiry): string {
  const businessName = escapeHtml(inquiry.businessName);

  return layout(
    `${heading(`Wholesale inquiry from ${businessName}`)}
    ${panel(
      details([
        ['Contact', escapeHtml(inquiry.contactName)],
        ['Email', escapeHtml(inquiry.email)],
        ['Phone', escapeHtml(inquiry.phone)],
      ])
    )}
    ${panel(`<span style="white-space:pre-wrap;">${escapeHtml(inquiry.message)}</span>`)}
    ${button('Reply', `mailto:${inquiry.email}`)}`,
    `Wholesale inquiry from ${inquiry.businessName}`,
    `Wholesale inquiry from ${inquiry.businessName}`,
    { internal: true }
  );
}

export function wholesaleConfirmationHtml(inquiry: WholesaleInquiry): string {
  return layout(
    `${heading('We received your wholesale inquiry')}
    ${body(`Thanks, ${escapeHtml(inquiry.contactName)}. We'll reply about <strong>${escapeHtml(inquiry.businessName)}</strong> with trade pricing and delivery options within one business day.`)}
    ${small('You can reply to this email if you want to add anything.')}`,
    'We will reply within one business day',
    'Wholesale inquiry received'
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
  const display = `${escapeHtml(code.slice(0, 3))}&nbsp;${escapeHtml(code.slice(3))}`;
  return layout(
    `${heading('Confirm your email for 10% off')}
    ${body(`Thanks for signing up. Enter this code on the site to confirm your email and get 10% off your first order. We'll also send you restock and new-flavour announcements.`)}
    ${codeBox(display, 'Valid for 24 hours, one use')}
    ${button('Enter your code', `${SITE_URL}/#newsletter`)}
    ${rule()}
    ${small(`If you didn't sign up, ignore this email and nothing will happen.`)}`,
    `Your code: ${code.slice(0, 3)} ${code.slice(3)}`,
    'Confirm your email',
    { marketing: true }
  );
}

/**
 * Sent after the subscriber successfully verifies their code.
 * Contains a unique single-use Stripe promo code.
 */
export function discountCodeHtml(promoCode: string): string {
  return layout(
    `${heading('Your 10% off code')}
    ${body('Enter this code at checkout to take 10% off your first order.')}
    ${codeBox(escapeHtml(promoCode), 'Expires in 24 hours, one use')}
    ${button('Shop with code applied', `${SITE_URL}/?promo=${encodeURIComponent(promoCode)}#shop`)}
    ${small('The code is applied for you at checkout. You can also type it in manually.')}`,
    `Use ${promoCode} at checkout`,
    'Your 10% off code',
    { marketing: true }
  );
}

/**
 * Plain welcome email (fallback path when email verification is disabled).
 */
export function welcomeHtml(): string {
  return layout(
    `${heading('You are on the list')}
    ${body(`We'll email you when we restock or launch something new. Nothing else.`)}
    ${button('Shop GingerBros', `${SITE_URL}/#shop`)}`,
    'Thanks for subscribing',
    'Welcome to GingerBros',
    { marketing: true }
  );
}

// ---------------------------------------------------------------------------
// Loyalty / reminders
// ---------------------------------------------------------------------------

export function boxReturnRewardHtml(amountBaht: number, code?: string | null): string {
  return layout(
    `${heading(`฿${amountBaht} off your next order`)}
    ${body(`Thanks for sending your box back. We've added ฿${amountBaht} of credit for you.`)}
    ${
      code
        ? `${codeBox(escapeHtml(code), `฿${amountBaht} off, enter at checkout`)}`
        : panel(`The credit is saved to this email address. Check out with the same email and it comes off automatically. No code needed.`)
    }
    ${button('Shop GingerBros', `${SITE_URL}/#shop`)}`,
    `฿${amountBaht} credit for your next order`,
    'Box return credit',
    { marketing: true }
  );
}

export function backInStockHtml(productName: string, productUrl: string): string {
  const name = escapeHtml(productName);
  return layout(
    `${heading(`${name} is back in stock`)}
    ${body(`You asked us to tell you when it was available again. Stock is limited and we can't reserve it.`)}
    ${button('View product', productUrl)}`,
    `${productName} is available again`,
    `${productName} is back in stock`,
    { marketing: true }
  );
}

export function abandonedCartHtml(snapshot: CartSnapshot): string {
  const rows: Row[] = snapshot.items.map((item) => ({
    description: item.name,
    quantity: item.quantity,
    amount: `฿${(item.price * item.quantity).toLocaleString('en-US')}`,
    image: imageUrl(item.image),
  }));

  return layout(
    `${heading('Your cart is still saved')}
    ${body(`You left these in your cart. Nothing has been charged.`)}
    ${itemsTable(rows, `฿${snapshot.subtotal.toLocaleString('en-US')}`)}
    ${button('Return to your cart', snapshot.url)}
    ${small('Orders over ฿500 ship free.')}`,
    `${snapshot.items.length} item${snapshot.items.length === 1 ? '' : 's'} waiting in your cart`,
    'Your cart',
    { marketing: true }
  );
}

// ---------------------------------------------------------------------------
// Admin login
// ---------------------------------------------------------------------------

export function adminLoginHtml(link: string): string {
  return layout(
    `${heading('Log in to GingerBros admin')}
    ${body('Use the button below to log in. The link works once and expires in 15 minutes.')}
    ${button('Log in', link)}
    ${rule()}
    ${small(`If you didn't request this, ignore it. The link is useless without access to this inbox.`)}`,
    'Your one-time login link',
    'GingerBros admin login',
    { internal: true }
  );
}
