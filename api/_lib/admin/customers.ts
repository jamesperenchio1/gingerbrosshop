import type Stripe from 'stripe';
import { getCredit } from '../credits.js';

export interface CustomerRow {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  created: number;
  delinquent: boolean;
  currency: string | null;
  stripeBalance: number;
  storeCredit: number;
  subscriptionCount: number;
}

export interface CustomerDetail extends CustomerRow {
  address: Record<string, unknown> | null;
  description: string | null;
  defaultPaymentMethod: string | null;
  subscriptions: Array<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    interval: string | null;
    intervalCount: number | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: boolean;
    itemsLabel: string;
  }>;
  paymentMethods: Array<{ id: string; brand: string | null; last4: string | null; expMonth: number | null; expYear: number | null }>;
  recentPayments: Array<{ id: string; amount: number; currency: string; status: string; created: number; description: string | null }>;
  invoices: Array<{
    id: string;
    status: string | null;
    amountDue: number;
    amountPaid: number;
    currency: string;
    created: number;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
  }>;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

async function subscriptionCountFor(stripe: Stripe, customerId: string): Promise<number> {
  try {
    const list = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
    return list.data.filter((s) => s.status === 'active' || s.status === 'trialing' || s.status === 'past_due').length;
  } catch {
    return 0;
  }
}

export async function listCustomers(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; email?: string } = {}
): Promise<{ customers: CustomerRow[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const params: Stripe.CustomerListParams = { limit };
  if (opts.startingAfter) params.starting_after = opts.startingAfter;
  if (opts.email) params.email = opts.email.trim().toLowerCase();

  const list = await stripe.customers.list(params);
  const customers = await Promise.all(
    list.data.map(async (c): Promise<CustomerRow> => ({
      id: c.id,
      email: c.email ?? null,
      name: c.name ?? null,
      phone: c.phone ?? null,
      created: c.created,
      delinquent: Boolean(c.delinquent),
      currency: c.currency ?? null,
      stripeBalance: c.balance ?? 0,
      storeCredit: c.email ? await getCredit(c.email) : 0,
      subscriptionCount: await subscriptionCountFor(stripe, c.id),
    }))
  );

  const last = list.data[list.data.length - 1];
  return {
    customers,
    hasMore: Boolean(list.has_more),
    nextCursor: list.has_more && last ? last.id : null,
  };
}

export async function getCustomerDetail(stripe: Stripe, id: string): Promise<CustomerDetail> {
  const customer = await stripe.customers.retrieve(id);
  if (customer.deleted) throw new Error('Customer has been deleted.');

  const [subs, pms, payments, invoices] = await Promise.all([
    stripe.subscriptions.list({ customer: id, status: 'all', limit: 50, expand: ['data.items.data.price'] }),
    stripe.paymentMethods.list({ customer: id, type: 'card', limit: 10 }),
    stripe.paymentIntents.list({ customer: id, limit: 10 }),
    stripe.invoices.list({ customer: id, limit: 10 }),
  ]);

  const activeCount = subs.data.filter(
    (s) => s.status === 'active' || s.status === 'trialing' || s.status === 'past_due'
  ).length;

  return {
    id: customer.id,
    email: customer.email ?? null,
    name: customer.name ?? null,
    phone: customer.phone ?? null,
    created: customer.created,
    delinquent: Boolean(customer.delinquent),
    currency: customer.currency ?? null,
    stripeBalance: customer.balance ?? 0,
    storeCredit: customer.email ? await getCredit(customer.email) : 0,
    subscriptionCount: activeCount,
    address: (customer.address as unknown as Record<string, unknown> | null) ?? null,
    description: customer.description ?? null,
    defaultPaymentMethod: idOf(customer.invoice_settings?.default_payment_method ?? null),
    subscriptions: subs.data.map((s) => {
      const first = s.items.data[0];
      return {
        id: s.id,
        status: s.status,
        amount: first?.price?.unit_amount != null ? first.price.unit_amount * (first.quantity ?? 1) : 0,
        currency: first?.price?.currency ?? 'thb',
        interval: first?.price?.recurring?.interval ?? null,
        intervalCount: first?.price?.recurring?.interval_count ?? null,
        currentPeriodEnd: first?.current_period_end ?? null,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        itemsLabel: first?.price?.nickname ?? idOf(first?.price?.product) ?? 'Subscription',
      };
    }),
    paymentMethods: pms.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? null,
      last4: pm.card?.last4 ?? null,
      expMonth: pm.card?.exp_month ?? null,
      expYear: pm.card?.exp_year ?? null,
    })),
    recentPayments: payments.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: pi.created,
      description: pi.description ?? null,
    })),
    invoices: invoices.data.map((inv) => ({
      id: inv.id,
      status: inv.status ?? null,
      amountDue: inv.amount_due,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      created: inv.created,
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      invoicePdf: inv.invoice_pdf ?? null,
    })),
  };
}

/** Edit the basic profile fields on a customer. */
export async function updateCustomer(
  stripe: Stripe,
  opts: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: Record<string, unknown> | null;
  }
): Promise<{ id: string }> {
  const params: Stripe.CustomerUpdateParams = {};
  if (opts.name !== undefined) params.name = opts.name ?? '';
  if (opts.email !== undefined) params.email = opts.email ?? '';
  if (opts.phone !== undefined) params.phone = opts.phone ?? '';
  if (opts.address !== undefined) {
    params.address = (opts.address as Stripe.AddressParam | null) ?? undefined;
  }
  if (Object.keys(params).length === 0) throw new Error('Nothing to update.');
  const customer = await stripe.customers.update(opts.id, params);
  return { id: customer.id };
}
