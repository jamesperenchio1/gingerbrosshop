import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe } from '../stripe.js';
import { getOrders } from '../orders.js';
import { rateLimit, getClientIp } from '../rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `track:${getClientIp(req)}`, limit: 20, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const email = (req.query.email as string)?.toLowerCase().trim();
  const orderNum = (req.query.order as string)?.toUpperCase().trim();

  if (!email || !orderNum) {
    res.status(400).json({ error: 'Email and order number are required' });
    return;
  }

  // orderNum is the last 8 chars of session ID
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

  // Optionally refresh from Stripe to get latest status
  const stripe = getStripe(secret);
  try {
    const session = await stripe.checkout.sessions.retrieve(order.sessionId, {
      expand: ['line_items.data.price.product'],
    });

    const lineItems = session.line_items?.data.map((li) => ({
      description: li.description ?? 'Item',
      quantity: li.quantity ?? 1,
      amountTotal: li.amount_total,
    }));

    res.status(200).json({
      order: {
        sessionId: order.sessionId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        amountTotal: session.amount_total ?? order.amountTotal,
        currency: (session.currency ?? order.currency).toUpperCase(),
        status: session.payment_status ?? order.status,
        createdAt: order.createdAt,
        items: lineItems ?? order.items,
        trackingNumber: order.trackingNumber,
        trackingCarrier: order.trackingCarrier,
      },
    });
  } catch {
    // Fallback to cached order if Stripe fails
    res.status(200).json({ order });
  }
}
