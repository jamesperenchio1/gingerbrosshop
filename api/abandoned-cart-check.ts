import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getAllAbandonedCarts, markCartRecovered } from './lib/carts';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL ?? 'orders@gingerbrosshop.com';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = req.query.secret as string | undefined;
  const auth = req.headers.authorization;
  const cronToken = process.env.CRON_SECRET;
  const adminMatch = process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET;
  const cronMatch = cronToken && auth === `Bearer ${cronToken}`;
  if (!adminMatch && !cronMatch) {
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

  let sent = 0;
  for (const cart of abandoned) {
    if (resend) {
      try {
        const itemRows = cart.snapshot.items
          .map(
            (item) =>
              `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">฿${item.price * item.quantity}</td></tr>`
          )
          .join('');

        await resend.emails.send({
          from: `GingerBros <${fromEmail}>`,
          to: cart.email,
          subject: 'You left something brewing in your cart 🍺',
          html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2410;">
            <h2 style="color:#3D2410;">Your cart is waiting!</h2>
            <p>Hi there,</p>
            <p>You left these items in your cart. Complete your order while they are still in stock.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
              <thead><tr style="background:#F5F0EB;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th><th style="padding:8px;text-align:right;">Total</th></tr></thead>
              <tbody>${itemRows}</tbody>
            </table>
            <p style="font-size:18px;font-weight:600;">Subtotal: ฿${cart.snapshot.subtotal}</p>
            <a href="${cart.snapshot.url}" style="display:inline-block;margin-top:16px;background:#3D2410;color:#FDF8F0;font-family:system-ui,sans-serif;font-size:14px;font-weight:500;padding:12px 24px;border-radius:999px;text-decoration:none;">Complete My Order</a>
            <p style="margin-top:24px;font-size:13px;color:#888;">Free shipping on orders over ฿500.</p>
          </div>`,
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
