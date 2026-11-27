import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllAbandonedCarts, markCartRecovered, markReminded, recentlyReminded, sanitizeCart } from '../carts.js';
import { getResend, MAIL_FROM, abandonedCartHtml } from '../email.js';
import { sendEmail, flushOutbox, withUnsubscribe, EmailError } from '../mailer.js';
import { isSuppressed } from '../subscribers.js';

/** Older than this, a reminder is just noise: stop retrying. */
const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

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
      const snapshot = sanitizeCart(cart.snapshot);
      const first = snapshot.items[0];
      await sendEmail(
        await withUnsubscribe({
          from: MAIL_FROM,
          to: cart.email,
          subject: `${first?.quantity ?? 1} × ${first?.name ?? 'Ginger Fizz'}${snapshot.items.length > 1 ? ` and ${snapshot.items.length - 1} more` : ''} still in your cart`,
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
