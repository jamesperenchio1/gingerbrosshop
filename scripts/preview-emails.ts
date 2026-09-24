// Renders every email template with fixture data to an output dir for eyeballing.
// Usage: npx tsx scripts/preview-emails.ts [outDir]   (default: ./email-preview)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as e from '../api/_lib/email.ts';

const out = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'email-preview';
mkdirSync(out, { recursive: true });

// Pass --escape to render with HTML-injection strings instead of realistic data.
const escapeMode = process.argv.includes('--escape');
const evil = escapeMode ? '<b>Zed</b> "&\'' : 'Nok Suwan';
const giftMsg = escapeMode ? 'Happy birthday <script>x</script>' : 'Happy birthday Mali, enjoy!';
const note = escapeMode ? 'Leave at the guard desk <b>please</b>' : 'Please leave at the guard desk.';
const items = [
  { description: 'Ginger Fizz 6-Pack', quantity: 2, amount_total: 150000, price: null },
  { description: escapeMode ? 'Ginger Fizz <i>Single</i>' : 'Ginger Fizz Single', quantity: 1, amount_total: 14000, price: null },
] as never[];
const session = {
  id: 'cs_live_a1b2c3d4e5f6ABCD1234',
  mode: 'payment',
  amount_total: 164000,
  customer_details: { name: evil, email: 'zed@example.com', phone: '+66 81 234 5678' },
  shipping_details: { name: evil, address: { line1: '12 Sukhumvit Soi 24', city: 'Bangkok', postal_code: '10110', country: 'TH' } },
  metadata: { isGift: 'true', recipientName: 'Mali', recipientEmail: 'mali@example.com', giftMessage: giftMsg },
} as never;
const order = {
  sessionId: 'cs_live_a1b2c3d4e5f6ABCD1234',
  customerName: evil,
  trackingNumber: 'TH123456789',
  trackingCarrier: 'Flash Express',
  items: [{ description: 'Ginger Fizz 6-Pack', quantity: 2 }],
} as never;
const inquiry = { businessName: escapeMode ? 'Café <Nine>' : 'Café Nine', contactName: 'Nok', email: 'nok@cafe.co', phone: '081', message: 'We want 40 cases.\nDelivery to Chiang Mai?' };

const files: Record<string, string> = {
  'seller-order': e.sellerNotificationHtml(session, items, note),
  'gift': e.giftEmailHtml(session, items, 'Mali', giftMsg, evil),
  'shipped': e.shippingNotificationHtml(order),
  'tracking-status': e.trackingInfoEmailHtml(order),
  'tracking-status-pending': e.trackingInfoEmailHtml({ ...(order as object), trackingNumber: '' } as never),
  'wholesale-inquiry': e.wholesaleInquiryHtml(inquiry),
  'wholesale-confirmation': e.wholesaleConfirmationHtml(inquiry),
  'welcome-code': e.welcomeWithCodeHtml('482913'),
  'discount-code': e.discountCodeHtml('GB-7XK2M9'),
  'welcome-plain': e.welcomeHtml(),
  'reward-code': e.boxReturnRewardHtml(50, 'BOX-4F8A2C'),
  'reward-nocode': e.boxReturnRewardHtml(50),
  'back-in-stock': e.backInStockHtml('Ginger Fizz <6-Pack>', 'https://gingerbrosshop.com/product/ginger-fizz-6pack'),
  'abandoned-cart': e.abandonedCartHtml({ items: [{ name: 'Ginger Fizz', price: 140, quantity: 3, image: '/images/ginger-fizz-new.png' }, { name: 'Ginger Fizz 6-Pack', price: 750, quantity: 1, image: '/images/ginger-fizz-6pack.png' }], subtotal: 1170, url: 'https://gingerbrosshop.com/cart?c=abc' } as never),
  'admin-login': e.adminLoginHtml('https://gingerbrosshop.com/admin/verify?t=abc'),
};
for (const [name, html] of Object.entries(files)) writeFileSync(join(out, `${name}.html`), html);
console.log(`Wrote ${Object.keys(files).length} emails to ${out}`);
