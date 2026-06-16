import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe, type SessionWithShipping } from '../stripe.js';
import { getOrderBySessionId } from '../orders.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const sessionId = req.query.session_id as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: 'Missing session_id' });
    return;
  }

  const stripe = getStripe(secret);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });

    if (session.status !== 'complete') {
      res.status(400).json({ error: 'Order not complete' });
      return;
    }

    const localOrder = await getOrderBySessionId(sessionId);

    const lineItems = session.line_items?.data.map((li) => ({
      description: li.description ?? 'Item',
      quantity: li.quantity ?? 1,
      amountTotal: li.amount_total,
      unitAmount: li.price?.unit_amount ?? 0,
    }));

    const sd = (session as SessionWithShipping).shipping_details;
    res.status(200).json({
      sessionId: session.id,
      customerEmail: session.customer_details?.email ?? null,
      customerName: session.customer_details?.name ?? null,
      customerPhone: session.customer_details?.phone ?? null,
      shippingAddress: sd?.address ?? null,
      shippingName: sd?.name ?? null,
      amountTotal: session.amount_total,
      currency: session.currency?.toUpperCase() ?? 'THB',
      status: session.payment_status,
      createdAt: new Date(session.created * 1000).toISOString(),
      items: lineItems ?? [],
      trackingNumber: localOrder?.trackingNumber ?? null,
      trackingCarrier: localOrder?.trackingCarrier ?? null,
      isGift: localOrder?.isGift ?? false,
      recipientEmail: localOrder?.recipientEmail ?? null,
      recipientName: localOrder?.recipientName ?? null,
      giftMessage: localOrder?.giftMessage ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    res.status(500).json({ error: message });
  }
}
