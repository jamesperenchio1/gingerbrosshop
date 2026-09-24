import type Stripe from 'stripe';

export interface AdminInvoice {
  id: string;
  number: string | null;
  status: string | null;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  amountDue: number;
  amountPaid: number;
  amountRemaining: number;
  currency: string;
  created: string;
  dueDate: string | null;
  paid: boolean;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  subscriptionId: string | null;
  description: string | null;
  canSend: boolean;
  canVoid: boolean;
}

export interface AdminInvoiceLine {
  id: string;
  description: string | null;
  quantity: number | null;
  amount: number;
  currency: string;
}

export interface AdminInvoiceDetail extends AdminInvoice {
  lines: AdminInvoiceLine[];
  paymentIntentId: string | null;
  attemptCount: number;
  nextPaymentAttempt: string | null;
  subtotal: number;
  tax: number;
  total: number;
  memo: string | null;
  footer: string | null;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function toAdminInvoice(inv: Stripe.Invoice): AdminInvoice {
  const customer = inv.customer && typeof inv.customer !== 'string' ? inv.customer : null;
  return {
    id: inv.id ?? '',
    number: inv.number ?? null,
    status: inv.status ?? null,
    customerId: idOf(inv.customer),
    customerName: inv.customer_name ?? customer?.name ?? null,
    customerEmail: inv.customer_email ?? customer?.email ?? null,
    amountDue: inv.amount_due ?? 0,
    amountPaid: inv.amount_paid ?? 0,
    amountRemaining: inv.amount_remaining ?? 0,
    currency: inv.currency ?? 'thb',
    created: new Date(inv.created * 1000).toISOString(),
    dueDate: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
    paid: Boolean(inv.paid),
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    invoicePdf: inv.invoice_pdf ?? null,
    subscriptionId: idOf(inv.subscription),
    description: inv.description ?? null,
    canSend: inv.status === 'draft' || inv.status === 'open',
    canVoid: inv.status === 'draft' || inv.status === 'open',
  };
}

export async function listInvoices(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; status?: string; customer?: string; email?: string } = {},
): Promise<{ invoices: AdminInvoice[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const params: Stripe.InvoiceListParams = { limit };
  if (opts.startingAfter) params.starting_after = opts.startingAfter;
  if (opts.customer) params.customer = opts.customer;
  if (opts.status && ['draft', 'open', 'paid', 'uncollectible', 'void'].includes(opts.status)) {
    params.status = opts.status as Stripe.InvoiceListParams.Status;
  }

  const res = await stripe.invoices.list(params);
  let rows = res.data;

  if (opts.email) {
    const needle = opts.email.trim().toLowerCase();
    rows = rows.filter((inv) => {
      const customer = inv.customer && typeof inv.customer !== 'string' ? inv.customer : null;
      return (inv.customer_email ?? customer?.email ?? '').toLowerCase().includes(needle);
    });
  }

  const lastRaw = res.data[res.data.length - 1];
  return {
    invoices: rows.map(toAdminInvoice),
    hasMore: Boolean(res.has_more),
    nextCursor: res.has_more && lastRaw ? lastRaw.id ?? null : null,
  };
}

export async function getInvoiceDetail(stripe: Stripe, id: string): Promise<AdminInvoiceDetail> {
  if (!id) throw new Error('Missing invoice id.');
  const inv = await stripe.invoices.retrieve(id, {
    expand: ['customer', 'subscription', 'payment_intent', 'lines'],
  });

  const lines: AdminInvoiceLine[] =
    inv.lines?.data?.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity,
      amount: li.amount,
      currency: li.currency,
    })) ?? [];

  return {
    ...toAdminInvoice(inv),
    lines,
    paymentIntentId: idOf(inv.payment_intent as string | { id: string } | null),
    attemptCount: inv.attempt_count ?? 0,
    nextPaymentAttempt: inv.next_payment_attempt
      ? new Date(inv.next_payment_attempt * 1000).toISOString()
      : null,
    subtotal: inv.subtotal ?? 0,
    tax: inv.tax ?? 0,
    total: inv.total ?? 0,
    memo: inv.description ?? null,
    footer: inv.footer ?? null,
  };
}

/** Email the hosted invoice to the customer. Requires the strict confirm check upstream. */
export async function sendInvoice(
  stripe: Stripe,
  opts: { id: string; adminEmail?: string | null },
): Promise<AdminInvoice> {
  if (!opts.id) throw new Error('Missing invoice id.');
  const inv = await stripe.invoices.sendInvoice(opts.id);
  return toAdminInvoice(inv);
}

/** Void an open or draft invoice. Requires the strict confirm check upstream. */
export async function voidInvoice(
  stripe: Stripe,
  opts: { id: string; adminEmail?: string | null },
): Promise<AdminInvoice> {
  if (!opts.id) throw new Error('Missing invoice id.');
  const inv = await stripe.invoices.voidInvoice(opts.id);
  return toAdminInvoice(inv);
}
