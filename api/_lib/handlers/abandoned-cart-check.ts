import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllAbandonedCarts, markCartRecovered, markReminded, recentlyReminded, rebuildCart, type PriceCatalog } from '../carts.js';
import { getStripe } from '../stripe.js';
import { getResend, MAIL_FROM, abandonedCartHtml } from '../email.js';
import { sendEmail, flushOutbox, withUnsubscribe, EmailError } from '../mailer.js';
import { isSuppressed } from '../subscribers.js';

/** Older than this, a reminder is just noise: stop retrying. */
const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

async function priceCatalog(): Promise<PriceCatalog> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY not configured');
  const prices = await getStripe(secret)
    .prices.list({ active: true, limit: 100, expand: ['data.product'] })
    .autoPagingToArray({ limit: 1000 });
  const catalog: PriceCatalog = new Map();
  for (const price of prices) {
    const product = price.product;
    if (typeof product === 'string' || product.deleted || !product.active) continue;
    // THB, the shop's only currency, has two decimal places.
    catalog.set(price.id, { name: product.name, price: (price.unit_amount ?? 0) / 100, image: product.images?.[0] ?? '' });
  }
  return catalog;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Only Vercel Cron (Bearer CRON_SECRET) may trigger this.
  const auth = req.headers.authorization;
  const cronToken = process.env.CRON_SECRET;
  if (!cronToken || auth !== `Bearer ${cronToken}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const outbox = await flushOutbox().catch((err) => {
    console.error('abandoned-cart: outbox flush failed:', err);
    return null;
  });

  const carts = await getAllAbandonedCarts();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const abandoned = carts.filter((c) => {
    const created = new Date(c.snapshot.createdAt).getTime();
    return now - created > oneHour && !c.snapshot.recovered;
  });

  const resend = getResend();
  // If Stripe is unreachable this throws, and every cart is tried again tomorrow.
  const catalog = abandoned.length > 0 ? await priceCatalog() : new Map();
  let sent = 0;
  let failed = 0;
  for (const cart of abandoned) {
    if (!resend) break;
    try {
      const stale = now - new Date(cart.snapshot.createdAt).getTime() > GIVE_UP_AFTER_MS;
      if (stale || (await isSuppressed(cart.email)) || (await recentlyReminded(cart.email))) {
        await markCartRecovered(cart.email);
        continue;
      }
      const snapshot = rebuildCart(cart.snapshot, catalog);
      if (!snapshot) {
        await markCartRecovered(cart.email);
        continue;
      }
      const first = snapshot.items[0];
      await sendEmail(
        await withUnsubscribe({
          from: MAIL_FROM,
          to: cart.email,
          subject: `${first.quantity} × ${first.name}${snapshot.items.length > 1 ? ` and ${snapshot.items.length - 1} more` : ''} still in your cart`,
          html: abandonedCartHtml(snapshot),
        }),
      );
      await markReminded(cart.email);
      await markCartRecovered(cart.email);
      sent++;
    } catch (err) {
      failed++;
      console.error('Failed to send abandoned cart email:', err);
      // A malformed address will never work; anything else is retried tomorrow.
      if (err instanceof EmailError && err.code === 'validation_error') await markCartRecovered(cart.email);
    }
  }

  res.status(200).json({ checked: carts.length, sent, failed, outbox });
}
