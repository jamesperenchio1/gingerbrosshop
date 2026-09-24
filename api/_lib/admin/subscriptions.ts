import type Stripe from 'stripe';

/** A subscription row as shown in the admin list. */
export interface SubscriptionRow {
  id: string;
  status: string;
  customerId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  created: number;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  paused: boolean;
  amount: number;
  currency: string;
  interval: string | null;
  intervalCount: number | null;
  itemCount: number;
  itemsLabel: string;
  latestInvoiceId: string | null;
  latestInvoiceStatus: string | null;
  trialEnd: number | null;
}

export interface SubscriptionDetail extends SubscriptionRow {
  items: Array<{
    id: string;
    priceId: string | null;
    productId: string | null;
    productName: string | null;
    quantity: number | null;
    unitAmount: number | null;
    currency: string;
    interval: string | null;
    intervalCount: number | null;
    recurring: boolean;
  }>;
  customer: { id: string; email: string | null; name: string | null; phone: string | null } | null;
  defaultPaymentMethod: { id: string; brand: string | null; last4: string | null; expMonth: number | null; expYear: number | null } | null;
  discount: { couponId: string | null; percentOff: number | null; amountOff: number | null; currency: string | null; duration: string | null } | null;
  latestInvoice: {
    id: string;
    status: string | null;
    amountDue: number;
    amountPaid: number;
    currency: string;
    created: number;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
  } | null;
  cancelAt: number | null;
  canceledAt: number | null;
  startDate: number;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function customerOf(value: Stripe.Subscription['customer']): Stripe.Customer | null {
  if (!value || typeof value === 'string' || value.deleted) return null;
  return value as Stripe.Customer;
}

function itemsLabelOf(sub: Stripe.Subscription): string {
  const names = sub.items.data
    .map((i) => i.price?.nickname ?? i.price?.product)
    .filter((n): n is string => typeof n === 'string' && n.length > 0);
  if (names.length === 0) return `${sub.items.data.length} item(s)`;
  if (names.length === 1) {
    const qty = sub.items.data[0]?.quantity ?? 1;
    return qty > 1 ? `${names[0]} ×${qty}` : names[0];
  }
  return `${names[0]} +${names.length - 1} more`;
}

function summarize(sub: Stripe.Subscription): SubscriptionRow {
  const first = sub.items.data[0];
  const cust = customerOf(sub.customer);
  const latestInvoice = sub.latest_invoice && typeof sub.latest_invoice !== 'string' ? sub.latest_invoice : null;

  return {
    id: sub.id,
    status: sub.status,
    customerId: idOf(sub.customer),
    customerEmail: cust?.email ?? null,
    customerName: cust?.name ?? null,
    created: sub.created,
    currentPeriodEnd: first?.current_period_end ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    paused: Boolean(sub.pause_collection),
    amount: first?.price?.unit_amount != null ? first.price.unit_amount * (first.quantity ?? 1) : 0,
    currency: first?.price?.currency ?? 'thb',
    interval: first?.price?.recurring?.interval ?? null,
    intervalCount: first?.price?.recurring?.interval_count ?? null,
    itemCount: sub.items.data.length,
    itemsLabel: itemsLabelOf(sub),
    latestInvoiceId: latestInvoice?.id ?? idOf(sub.latest_invoice),
    latestInvoiceStatus: latestInvoice?.status ?? null,
    trialEnd: sub.trial_end ?? null,
  };
}

export async function listSubscriptions(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; status?: string; email?: string } = {}
): Promise<{ subscriptions: SubscriptionRow[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const params: Stripe.SubscriptionListParams = { limit, expand: ['data.customer'] };
  if (opts.startingAfter) params.starting_after = opts.startingAfter;
  if (opts.status && opts.status !== 'all') {
    params.status = opts.status as Stripe.SubscriptionListParams.Status;
  }

  const list = await stripe.subscriptions.list(params);
  let rows = list.data;
  if (opts.email) {
    const needle = opts.email.trim().toLowerCase();
    rows = rows.filter((s) => (customerOf(s.customer)?.email ?? '').toLowerCase().includes(needle));
  }

  const last = list.data[list.data.length - 1];
  return {
    subscriptions: rows.map(summarize),
    hasMore: Boolean(list.has_more),
    nextCursor: list.has_more && last ? last.id : null,
  };
}

export async function getSubscriptionDetail(stripe: Stripe, id: string): Promise<SubscriptionDetail> {
  const sub = await stripe.subscriptions.retrieve(id, {
    expand: ['customer', 'items.data.price.product', 'latest_invoice', 'default_payment_method', 'discounts'],
  });
  const base = summarize(sub);
  const cust = customerOf(sub.customer);

  const pm = sub.default_payment_method && typeof sub.default_payment_method !== 'string' ? sub.default_payment_method : null;
  const card = pm && pm.card ? pm.card : null;
  const latestInvoice = sub.latest_invoice && typeof sub.latest_invoice !== 'string' ? sub.latest_invoice : null;

  const discount = sub.discounts?.[0];
  const coupon = discount && typeof discount.coupon !== 'string' ? discount.coupon : null;

  return {
    ...base,
    items: sub.items.data.map((item) => {
      const product = item.price?.product && typeof item.price.product !== 'string' ? item.price.product : null;
      return {
        id: item.id,
        priceId: item.price?.id ?? null,
        productId: idOf(item.price?.product),
        productName: product && 'name' in product ? (product.name ?? null) : null,
        quantity: item.quantity ?? null,
        unitAmount: item.price?.unit_amount ?? null,
        currency: item.price?.currency ?? 'thb',
        interval: item.price?.recurring?.interval ?? null,
        intervalCount: item.price?.recurring?.interval_count ?? null,
        recurring: Boolean(item.price?.recurring),
      };
    }),
    customer: cust
      ? { id: cust.id, email: cust.email ?? null, name: cust.name ?? null, phone: cust.phone ?? null }
      : null,
    defaultPaymentMethod: pm
      ? { id: pm.id, brand: card?.brand ?? null, last4: card?.last4 ?? null, expMonth: card?.exp_month ?? null, expYear: card?.exp_year ?? null }
      : null,
    discount: coupon
      ? {
          couponId: coupon.id,
          percentOff: coupon.percent_off ?? null,
          amountOff: coupon.amount_off ?? null,
          currency: coupon.currency ?? null,
          duration: coupon.duration ?? null,
        }
      : null,
    latestInvoice: latestInvoice
      ? {
          id: latestInvoice.id,
          status: latestInvoice.status ?? null,
          amountDue: latestInvoice.amount_due,
          amountPaid: latestInvoice.amount_paid,
          currency: latestInvoice.currency,
          created: latestInvoice.created,
          hostedInvoiceUrl: latestInvoice.hosted_invoice_url ?? null,
          invoicePdf: latestInvoice.invoice_pdf ?? null,
        }
      : null,
    cancelAt: sub.cancel_at ?? null,
    canceledAt: sub.canceled_at ?? null,
    startDate: sub.start_date,
  };
}

/**
 * Cancel a subscription. `atPeriodEnd` schedules cancellation (the customer keeps
 * access until the period ends); otherwise it cancels immediately. Requires the
 * caller to have passed the strict confirm check.
 */
export async function cancelSubscription(
  stripe: Stripe,
  opts: { id: string; atPeriodEnd?: boolean; reason?: string; adminEmail?: string | null }
): Promise<{ id: string; status: string; cancelAtPeriodEnd: boolean; cancelAt: number | null }> {
  if (opts.atPeriodEnd) {
    const sub = await stripe.subscriptions.update(opts.id, {
      cancel_at_period_end: true,
      metadata: { cancelReason: (opts.reason ?? '').slice(0, 480), canceledBy: opts.adminEmail ?? '' },
    });
    return { id: sub.id, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end, cancelAt: sub.cancel_at ?? null };
  }
  const sub = await stripe.subscriptions.cancel(opts.id, {
    cancellation_details: { comment: (opts.reason ?? '').slice(0, 480) },
  });
  return { id: sub.id, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end, cancelAt: sub.cancel_at ?? null };
}

/** Pause (stop collecting) or resume a subscription. */
export async function setSubscriptionPaused(
  stripe: Stripe,
  opts: { id: string; paused: boolean; reason?: string; adminEmail?: string | null }
): Promise<{ id: string; status: string; paused: boolean }> {
  const sub = await stripe.subscriptions.update(opts.id, {
    pause_collection: opts.paused ? { behavior: 'void' } : '',
    metadata: { pauseReason: opts.paused ? (opts.reason ?? '').slice(0, 480) : '' },
  });
  return { id: sub.id, status: sub.status, paused: Boolean(sub.pause_collection) };
}

/** Update quantities on a subscription's items, with an explicit proration policy. */
export async function updateSubscriptionItems(
  stripe: Stripe,
  opts: {
    id: string;
    items: Array<{ id: string; quantity: number }>;
    prorationBehavior?: 'always_invoice' | 'create_prorations' | 'none';
    reason?: string;
    adminEmail?: string | null;
  }
): Promise<{ id: string; status: string }> {
  if (!opts.items.length) throw new Error('No items to update.');
  const sub = await stripe.subscriptions.update(opts.id, {
    items: opts.items.map((i) => ({ id: i.id, quantity: Math.max(0, Math.round(i.quantity)) })),
    proration_behavior: opts.prorationBehavior ?? 'create_prorations',
    metadata: { updateReason: (opts.reason ?? '').slice(0, 480), updatedBy: opts.adminEmail ?? '' },
  });
  return { id: sub.id, status: sub.status };
}

/** Cards on file for a customer (used to decide whether a direct create is possible). */
export async function listCustomerPaymentMethods(
  stripe: Stripe,
  customerId: string
): Promise<Array<{ id: string; brand: string | null; last4: string | null; expMonth: number | null; expYear: number | null }>> {
  const list = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 10 });
  return list.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? null,
    last4: pm.card?.last4 ?? null,
    expMonth: pm.card?.exp_month ?? null,
    expYear: pm.card?.exp_year ?? null,
  }));
}

/**
 * Create a subscription-mode Checkout link the admin can send to a customer.
 * This never charges immediately — it's a shareable link, which is the safe path
 * when no payment method is on file.
 */
export async function createSubscriptionCheckout(
  stripe: Stripe,
  opts: {
    priceId: string;
    quantity?: number;
    customerId?: string | null;
    email?: string | null;
    trialDays?: number;
    successUrl: string;
    cancelUrl: string;
    adminEmail?: string | null;
  }
): Promise<{ sessionId: string; url: string | null }> {
  const price = await stripe.prices.retrieve(opts.priceId);
  if (!price.active) throw new Error('That price is not active.');
  if (!price.recurring) throw new Error('That price is not a recurring price.');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: opts.priceId, quantity: Math.max(1, Math.round(opts.quantity ?? 1)) }],
    customer: opts.customerId || undefined,
    customer_email: !opts.customerId && opts.email ? opts.email : undefined,
    allow_promotion_codes: true,
    subscription_data: opts.trialDays ? { trial_period_days: opts.trialDays } : undefined,
    metadata: { createdBy: opts.adminEmail ?? '', source: 'admin_console' },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
  });

  return { sessionId: session.id, url: session.url };
}

/**
 * Create a subscription directly, billing an existing saved payment method.
 * Refuses unless the customer has a card on file (or one is passed explicitly),
 * so we never create a subscription that can't be charged.
 */
export async function createSubscriptionDirect(
  stripe: Stripe,
  opts: {
    customerId: string;
    priceId: string;
    quantity?: number;
    paymentMethodId?: string | null;
    trialDays?: number;
    adminEmail?: string | null;
  }
): Promise<{ id: string; status: string; latestInvoiceId: string | null; latestInvoiceStatus: string | null }> {
  const price = await stripe.prices.retrieve(opts.priceId);
  if (!price.active) throw new Error('That price is not active.');
  if (!price.recurring) throw new Error('That price is not a recurring price.');

  const customer = await stripe.customers.retrieve(opts.customerId);
  if (customer.deleted) throw new Error('Customer has been deleted.');

  const savedDefault =
    customer.invoice_settings?.default_payment_method &&
    typeof customer.invoice_settings.default_payment_method !== 'string'
      ? customer.invoice_settings.default_payment_method.id
      : idOf(customer.invoice_settings?.default_payment_method ?? null);

  const cards = await listCustomerPaymentMethods(stripe, opts.customerId);
  const paymentMethod = opts.paymentMethodId || savedDefault || cards[0]?.id || null;
  if (!paymentMethod) {
    throw new Error('No saved payment method. Use the Checkout-link option instead, or add a card to the customer first.');
  }

  const sub = await stripe.subscriptions.create({
    customer: opts.customerId,
    items: [{ price: opts.priceId, quantity: Math.max(1, Math.round(opts.quantity ?? 1)) }],
    default_payment_method: paymentMethod,
    trial_period_days: opts.trialDays || undefined,
    payment_behavior: 'error_if_incomplete',
    metadata: { createdBy: opts.adminEmail ?? '', source: 'admin_console' },
    expand: ['latest_invoice'],
  });

  const invoice = sub.latest_invoice && typeof sub.latest_invoice !== 'string' ? sub.latest_invoice : null;
  return {
    id: sub.id,
    status: sub.status,
    latestInvoiceId: invoice?.id ?? null,
    latestInvoiceStatus: invoice?.status ?? null,
  };
}
