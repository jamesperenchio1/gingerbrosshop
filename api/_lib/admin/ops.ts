import type Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Disputes
// ---------------------------------------------------------------------------

export interface AdminDispute {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  chargeId: string | null;
  paymentIntentId: string | null;
  created: string;
  evidenceDueBy: string | null;
  hasEvidence: boolean;
  submissionCount: number;
  isChargeRefundable: boolean;
  networkReasonCode: string | null;
}

export interface AdminDisputeDetail extends AdminDispute {
  evidence: Record<string, string>;
  evidenceDetails: {
    dueBy: string | null;
    hasEvidence: boolean;
    pastDue: boolean;
    submissionCount: number;
  };
  evidenceText: string | null;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function toAdminDispute(d: Stripe.Dispute): AdminDispute {
  return {
    id: d.id,
    amount: d.amount,
    currency: d.currency,
    status: d.status,
    reason: d.reason,
    chargeId: idOf(d.charge),
    paymentIntentId: idOf(d.payment_intent as string | { id: string } | null),
    created: new Date(d.created * 1000).toISOString(),
    evidenceDueBy: d.evidence_details?.due_by
      ? new Date(d.evidence_details.due_by * 1000).toISOString()
      : null,
    hasEvidence: Boolean(d.evidence_details?.has_evidence),
    submissionCount: d.evidence_details?.submission_count ?? 0,
    isChargeRefundable: Boolean(d.is_charge_refundable),
    networkReasonCode: d.network_reason_code ?? null,
  };
}

export async function listDisputes(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string } = {},
): Promise<{ disputes: AdminDispute[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const res = await stripe.disputes.list({ limit, starting_after: opts.startingAfter });
  const lastRaw = res.data[res.data.length - 1];
  return {
    disputes: res.data.map(toAdminDispute),
    hasMore: Boolean(res.has_more),
    nextCursor: res.has_more && lastRaw ? lastRaw.id : null,
  };
}

export async function getDisputeDetail(stripe: Stripe, id: string): Promise<AdminDisputeDetail> {
  if (!id) throw new Error('Missing dispute id.');
  const d = await stripe.disputes.retrieve(id, { expand: ['charge', 'payment_intent'] });
  const evidence = (d.evidence ?? {}) as unknown as Record<string, string | undefined>;
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(evidence)) {
    if (v !== undefined && v !== null) clean[k] = String(v);
  }
  return {
    ...toAdminDispute(d),
    evidence: clean,
    evidenceDetails: {
      dueBy: d.evidence_details?.due_by
        ? new Date(d.evidence_details.due_by * 1000).toISOString()
        : null,
      hasEvidence: Boolean(d.evidence_details?.has_evidence),
      pastDue: Boolean(d.evidence_details?.past_due),
      submissionCount: d.evidence_details?.submission_count ?? 0,
    },
    evidenceText: clean.uncategorized_text ?? null,
  };
}

/** Text/file evidence fields Stripe accepts. File fields expect a file_upload id. */
const EVIDENCE_KEYS = [
  'access_activity_log',
  'billing_address',
  'cancellation_policy',
  'cancellation_policy_disclosure',
  'cancellation_rebuttal',
  'customer_communication',
  'customer_email_address',
  'customer_name',
  'customer_purchase_ip',
  'customer_signature',
  'duplicate_charge_explanation',
  'duplicate_charge_id',
  'product_description',
  'receipt',
  'refund_policy',
  'refund_policy_disclosure',
  'refund_refusal_explanation',
  'service_date',
  'service_documentation',
  'shipping_address',
  'shipping_carrier',
  'shipping_date',
  'shipping_documentation',
  'shipping_tracking_number',
  'uncategorized_file',
  'uncategorized_text',
] as const;

/**
 * Submit (or save) dispute evidence. Passing `submit` sends it to the network.
 * Requires the strict confirm check upstream.
 */
export async function submitDisputeEvidence(
  stripe: Stripe,
  opts: { id: string; evidence: Record<string, unknown>; submit: boolean; adminEmail?: string | null },
): Promise<AdminDispute> {
  if (!opts.id) throw new Error('Missing dispute id.');
  const evidence: Record<string, string> = {};
  for (const key of EVIDENCE_KEYS) {
    const value = opts.evidence?.[key];
    if (value === undefined || value === null || value === '') continue;
    evidence[key] = String(value);
  }
  if (Object.keys(evidence).length === 0) {
    throw new Error('No evidence fields provided.');
  }

  const params: Stripe.DisputeUpdateParams = {
    evidence: evidence as unknown as Stripe.DisputeUpdateParams.Evidence,
    metadata: { adminEmail: opts.adminEmail ?? '' },
  };
  if (opts.submit) params.submit = true;

  const d = await stripe.disputes.update(opts.id, params);
  return toAdminDispute(d);
}

// ---------------------------------------------------------------------------
// Payouts
// ---------------------------------------------------------------------------

export interface AdminPayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string | null;
  created: string;
  method: string | null;
  type: string | null;
  description: string | null;
  statementDescriptor: string | null;
  failureMessage: string | null;
  reversed: boolean;
  automatic: boolean;
  canCancel: boolean;
}

function toAdminPayout(p: Stripe.Payout): AdminPayout {
  return {
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    arrivalDate: p.arrival_date ? new Date(p.arrival_date * 1000).toISOString() : null,
    created: new Date(p.created * 1000).toISOString(),
    method: p.method ?? null,
    type: p.type ?? null,
    description: p.description ?? null,
    statementDescriptor: p.statement_descriptor ?? null,
    failureMessage: p.failure_message ?? null,
    reversed: Boolean(p.reversed),
    automatic: Boolean(p.automatic),
    canCancel: p.status === 'pending' || p.status === 'in_transit',
  };
}

export async function listPayouts(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; status?: string } = {},
): Promise<{ payouts: AdminPayout[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const params: Stripe.PayoutListParams = { limit };
  if (opts.startingAfter) params.starting_after = opts.startingAfter;
  if (opts.status && ['paid', 'pending', 'in_transit', 'canceled', 'failed'].includes(opts.status)) {
    params.status = opts.status as Stripe.PayoutListParams.Status;
  }
  const res = await stripe.payouts.list(params);
  const lastRaw = res.data[res.data.length - 1];
  return {
    payouts: res.data.map(toAdminPayout),
    hasMore: Boolean(res.has_more),
    nextCursor: res.has_more && lastRaw ? lastRaw.id : null,
  };
}

export async function getBalance(stripe: Stripe): Promise<{
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
}> {
  const balance = await stripe.balance.retrieve();
  return {
    available: balance.available.map((b) => ({ amount: b.amount, currency: b.currency })),
    pending: balance.pending.map((b) => ({ amount: b.amount, currency: b.currency })),
  };
}

/** Manually create a payout from the available balance. Requires the strict confirm check upstream. */
export async function createPayout(
  stripe: Stripe,
  opts: { amount: number; currency?: string; adminEmail?: string | null },
): Promise<AdminPayout> {
  const amount = Math.round(Number(opts.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('A positive payout amount is required.');
  }
  const payout = await stripe.payouts.create({
    amount,
    currency: (opts.currency ?? 'thb').toLowerCase(),
    metadata: { adminEmail: opts.adminEmail ?? '' },
  });
  return toAdminPayout(payout);
}

/** Cancel a pending/in-transit payout. Requires the strict confirm check upstream. */
export async function cancelPayout(
  stripe: Stripe,
  opts: { id: string; adminEmail?: string | null },
): Promise<AdminPayout> {
  if (!opts.id) throw new Error('Missing payout id.');
  const payout = await stripe.payouts.cancel(opts.id);
  return toAdminPayout(payout);
}

// ---------------------------------------------------------------------------
// Events (webhook log)
// ---------------------------------------------------------------------------

export interface AdminEvent {
  id: string;
  type: string;
  created: string;
  apiVersion: string | null;
  pendingWebhooks: number;
  requestId: string | null;
  livemode: boolean;
}

export interface AdminEventDetail extends AdminEvent {
  objectType: string | null;
  objectId: string | null;
  summary: string | null;
}

function toAdminEvent(e: Stripe.Event): AdminEvent {
  return {
    id: e.id,
    type: e.type,
    created: new Date(e.created * 1000).toISOString(),
    apiVersion: e.api_version ?? null,
    pendingWebhooks: e.pending_webhooks ?? 0,
    requestId: e.request?.id ?? null,
    livemode: Boolean(e.livemode),
  };
}

export async function listEvents(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; type?: string } = {},
): Promise<{ events: AdminEvent[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const params: Stripe.EventListParams = { limit };
  if (opts.startingAfter) params.starting_after = opts.startingAfter;
  if (opts.type) params.type = opts.type;
  const res = await stripe.events.list(params);
  const lastRaw = res.data[res.data.length - 1];
  return {
    events: res.data.map(toAdminEvent),
    hasMore: Boolean(res.has_more),
    nextCursor: res.has_more && lastRaw ? lastRaw.id : null,
  };
}

export async function getEventDetail(stripe: Stripe, id: string): Promise<AdminEventDetail> {
  if (!id) throw new Error('Missing event id.');
  const e = await stripe.events.retrieve(id);
  const object = e.data?.object as { id?: string; object?: string; status?: string } | undefined;
  const objectType = object?.object ?? null;
  const objectId = object?.id ?? null;
  const summaryParts = [objectType, objectId, object?.status].filter(Boolean);
  return {
    ...toAdminEvent(e),
    objectType,
    objectId,
    summary: summaryParts.length ? summaryParts.join(' · ') : null,
  };
}
