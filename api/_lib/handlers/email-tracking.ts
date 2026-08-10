import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders } from '../orders.js';
import { getResend, trackingInfoEmailHtml, MAIL_FROM } from '../email.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `email-track:${getClientIp(req)}`, limit: 5, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const resend = getResend();
  if (!resend) {
    res.status(500).json({ error: 'Email service not configured' });
    return;
  }

  const email = (req.body?.email ?? req.query?.email)?.toLowerCase().trim();
  const orderNum = (req.body?.order ?? req.query?.order)?.toUpperCase().trim();

  if (!email || !orderNum) {
    res.status(400).json({ error: 'Email and order number are required' });
    return;
  }

  const orders = await getOrders();
  const order = orders.find((o) => {
    const matchesNum = o.sessionId.slice(-8).toUpperCase() === orderNum;
    const matchesEmail = (o.customerEmail ?? '').toLowerCase() === email;
    return matchesNum && matchesEmail;
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found. Please check your email and order number.' });
    return;
  }

  try {
    const html = trackingInfoEmailHtml(order);
    const result = await resend.emails.send({
      from: MAIL_FROM,
      to: email,
      subject: `Your GingerBros order #${orderNum} status`,
      html,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      res.status(500).json({ error: 'Failed to send email. Please try again later.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Tracking email sent.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
}
