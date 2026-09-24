import type Stripe from 'stripe';
import { getOrders, getOrderBySessionId, type Order } from '../orders.js';

/** Human-facing short id, matching the storefront's order-number convention. */
export function orderNumber(sessionId: string): string {
  return sessionId.slice(-8).toUpperCase();
}

/** A Stripe checkout session merged with the local Redis record for that order. */
export interface MergedOrder {
  sessionId: string;
  orderNumber: string;
  createdAt: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  status: string;
  mode: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  itemCount: number;
  items: Array<{ id: string; description: string; quantity: number; amountTotal: number }>;
  shippingAddress: Record<string, unknown> | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  isGift: boolean;
  recipientEmail: string | null;
  recipientName: string | null;
  giftMessage: string | null;
  paymentIntentId: string | null;
  subscriptionId: string | null;
  hasLocalRecord: boolean;
}

export interface OrderRefundSummary {
  id: string;
  amount: number;
  status: string | null;
  created: number;
  reason: string | null;
}

export interface OrderDetail extends MergedOrder {
  refundedAmount: number;
  refunds: OrderRefundSummary[];
  paymentIntent: {
    id: string;
    status: string;
    amount: number;
    amountReceived: number;
    latestChargeId: string | null;
  } | null;
  subscription: {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number | null;
  } | null;
  invoice: {
    id: string;
    status: string | null;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
    amountDue: number;
    amountPaid: number;
  } | null;
  lineItems: Array<{ id: string; description: string | null; quantity: number | null; amountTotal: number | null }>;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

/** Sum of refunds that have not failed — what has actually left the account. */
function refundedTotal(refunds: Stripe.Refund[]): number {
  return refunds
    .filter((r) => r.status === 'succeeded' || r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);
}

function mergeSession(session: Stripe.Checkout.Session, local?: Order): MergedOrder {
  const details = session.customer_details;
  const email = details?.email ?? session.customer_email ?? local?.customerEmail ?? null;
  const name = details?.name ?? local?.customerName ?? null;
  const phone = details?.phone ?? local?.customerPhone ?? null;
  const address =
    (details?.address as unknown as Record<string, unknown> | null | undefined) ??
    local?.shippingAddress ??
    null;

  return {
    sessionId: session.id,
    orderNumber: orderNumber(session.id),
    createdAt: new Date(session.created * 1000).toISOString(),
    amountTotal: session.amount_total ?? local?.amountTotal ?? 0,
    currency: session.currency ?? local?.currency ?? 'thb',
    paymentStatus: session.payment_status ?? 'unpaid',
    status: session.status ?? 'open',
    mode: session.mode ?? local?.mode ?? 'payment',
    customerEmail: email,
    customerName: name,
    customerPhone: phone,
    itemCount: local ? local.items.reduce((sum, i) => sum + i.quantity, 0) : 0,
    items: local?.items ?? [],
    shippingAddress: address,
    trackingNumber: local?.trackingNumber ?? null,
    trackingCarrier: local?.trackingCarrier ?? null,
    isGift: Boolean(local?.isGift),
    recipientEmail: local?.recipientEmail ?? null,
    recipientName: local?.recipientName ?? null,
    giftMessage: local?.giftMessage ?? null,
    paymentIntentId: idOf(session.payment_intent),
    subscriptionId: idOf(session.subscription),
    hasLocalRecord: Boolean(local),
  };
}

export async function listOrders(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; status?: string; email?: string } = {}
): Promise<{ orders: MergedOrder[]; hasMore: boolean; nextCursor: string | null }> {
  const local = await getOrders();
  const byId = new Map(local.map((o) => [o.sessionId, o]));

  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const params: Stripe.Checkout.SessionListParams = { limit };
  if (opts.startingAfter) params.starting_after = opts.startingAfter;

  const sessions = await stripe.checkout.sessions.list(params);

  let rows = sessions.data;
  if (opts.status) rows = rows.filter((s) => s.status === opts.status);
  if (opts.email) {
    const needle = opts.email.trim().toLowerCase();
    rows = rows.filter((s) =>
      (s.customer_details?.email ?? s.customer_email ?? '').toLowerCase().includes(needle)
    );
  }

  const orders = rows.map((s) => mergeSession(s, byId.get(s.id)));
  const lastRaw = sessions.data[sessions.data.length - 1];
  const nextCursor = sessions.has_more && lastRaw ? lastRaw.id : null;

  return { orders, hasMore: Boolean(sessions.has_more), nextCursor };
}

export async function getOrderDetail(stripe: Stripe, sessionId: string): Promise<OrderDetail> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'subscription', 'customer', 'invoice', 'line_items'],
  });
  const local = await getOrderBySessionId(sessionId);
  const base = mergeSession(session, local);

  const paymentIntent = typeof session.payment_intent === 'string' ? null : session.payment_intent;
  let refunds: OrderRefundSummary[] = [];
  let refundedAmount = 0;
  if (base.paymentIntentId) {
    const list = await stripe.refunds.list({ payment_intent: base.paymentIntentId, limit: 100 });
    refunds = list.data.map((r) => ({
      id: r.id,
      amount: r.amount,
      status: r.status,
      created: r.created,
      reason: r.reason ?? null,
    }));
    refundedAmount = refundedTotal(list.data);
  }

  const subscription = typeof session.subscription === 'string' ? null : session.subscription;
  const invoice = typeof session.invoice === 'string' ? null : session.invoice;
  const latestCharge = paymentIntent ? idOf(paymentIntent.latest_charge as string | { id: string } | null) : null;

  return {
    ...base,
    refundedAmount,
    refunds,
    paymentIntent: paymentIntent
      ? {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          amountReceived: paymentIntent.amount_received,
          latestChargeId: latestCharge,
        }
      : null,
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd:
            subscription.items?.data?.[0]?.current_period_end ?? null,
        }
      : null,
    invoice: invoice
      ? {
          id: invoice.id,
          status: invoice.status ?? null,
          hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
          invoicePdf: invoice.invoice_pdf ?? null,
          amountDue: invoice.amount_due,
          amountPaid: invoice.amount_paid,
        }
      : null,
    lineItems:
      session.line_items?.data?.map((li) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity,
        amountTotal: li.amount_total,
      })) ?? [],
  };
}

const REFUND_REASONS: Record<string, Stripe.RefundCreateParams.Reason> = {
  duplicate: 'duplicate',
  fraudulent: 'fraudulent',
  requested_by_customer: 'requested_by_customer',
};

/**
 * Refund a one-time order (fully or partially). Never refunds more than is left
 * refundable on the payment intent. Requires the caller to have already passed
 * the strict confirm check.
 */
export async function refundOrder(
  stripe: Stripe,
  opts: { sessionId: string; amount?: number; reason?: string; reasonCode?: string; adminEmail?: string | null }
): Promise<{ refundId: string; amount: number; status: string | null; refundedTotal: number; refundableRemaining: number }> {
  const session = await stripe.checkout.sessions.retrieve(opts.sessionId);
  const piId = idOf(session.payment_intent);
  if (!piId) throw new Error('This order has no payment intent to refund.');

  const pi = await stripe.paymentIntents.retrieve(piId);
  if (pi.status !== 'succeeded') {
    throw new Error(`Cannot refund a payment with status "${pi.status}".`);
  }

  const existing = await stripe.refunds.list({ payment_intent: piId, limit: 100 });
  const alreadyRefunded = refundedTotal(existing.data);
  const refundable = (pi.amount_received || pi.amount) - alreadyRefunded;
  if (refundable <= 0) throw new Error('This payment has already been fully refunded.');

  const amount = opts.amount && opts.amount > 0 ? Math.round(opts.amount) : refundable;
  if (amount > refundable) {
    throw new Error(`Refund amount exceeds the refundable balance (${refundable} satang).`);
  }

  const reason =
    (opts.reasonCode && REFUND_REASONS[opts.reasonCode]) || 'requested_by_customer';

  const refund = await stripe.refunds.create({
    payment_intent: piId,
    amount,
    reason,
    metadata: {
      adminEmail: opts.adminEmail ?? '',
      note: (opts.reason ?? '').slice(0, 480),
    },
  });

  return {
    refundId: refund.id,
    amount: refund.amount,
    status: refund.status,
    refundedTotal: alreadyRefunded + refund.amount,
    refundableRemaining: refundable - refund.amount,
  };
}

/**
 * Cancel an order. Subscriptions are cancelled outright; a one-time payment is
 * cancelled at the intent level if it was never captured, otherwise it is
 * refunded in full. Requires the caller to have passed the strict confirm check.
 */
export async function cancelOrder(
  stripe: Stripe,
  opts: { sessionId: string; reason?: string; adminEmail?: string | null }
): Promise<
  | { kind: 'subscription'; subscriptionId: string; status: string }
  | { kind: 'payment_intent_cancelled'; paymentIntentId: string; status: string }
  | { kind: 'refunded'; refundId: string; amount: number; status: string | null }
> {
  const session = await stripe.checkout.sessions.retrieve(opts.sessionId);

  const subId = idOf(session.subscription);
  if (subId) {
    const sub = await stripe.subscriptions.cancel(subId);
    return { kind: 'subscription', subscriptionId: sub.id, status: sub.status };
  }

  const piId = idOf(session.payment_intent);
  if (!piId) throw new Error('This order has nothing to cancel.');

  const pi = await stripe.paymentIntents.retrieve(piId);
  if (pi.status === 'requires_capture' || pi.status === 'requires_confirmation' || pi.status === 'requires_payment_method') {
    const cancelled = await stripe.paymentIntents.cancel(piId);
    return { kind: 'payment_intent_cancelled', paymentIntentId: cancelled.id, status: cancelled.status };
  }
  if (pi.status === 'succeeded') {
    const existing = await stripe.refunds.list({ payment_intent: piId, limit: 100 });
    const refundable = (pi.amount_received || pi.amount) - refundedTotal(existing.data);
    if (refundable <= 0) throw new Error('This order has already been fully refunded.');
    const refund = await stripe.refunds.create({
      payment_intent: piId,
      amount: refundable,
      reason: 'requested_by_customer',
      metadata: { adminEmail: opts.adminEmail ?? '', note: (opts.reason ?? '').slice(0, 480) },
    });
    return { kind: 'refunded', refundId: refund.id, amount: refund.amount, status: refund.status };
  }
  throw new Error(`Cannot cancel a payment with status "${pi.status}".`);
}
