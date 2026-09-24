import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllAbandonedCarts, markCartRecovered } from '../carts.js';
import { getResend, MAIL_FROM, abandonedCartHtml } from '../email.js';

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

  const carts = await getAllAbandonedCarts();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const abandoned = carts.filter((c) => {
    const created = new Date(c.snapshot.createdAt).getTime();
    return now - created > oneHour && !c.snapshot.recovered;
  });

  const resend = getResend();
  let sent = 0;
  for (const cart of abandoned) {
    if (resend) {
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: cart.email,
          subject: 'You left something brewing in your cart',
          html: abandonedCartHtml(cart.snapshot),
        });
        await markCartRecovered(cart.email);
        sent++;
      } catch (err) {
        console.error('Failed to send abandoned cart email:', err);
      }
    }
  }

  res.status(200).json({ checked: carts.length, sent });
}
