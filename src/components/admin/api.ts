export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Query = Record<string, string | number | undefined>;

/**
 * Call /api/admin with the admin session cookie. Pass `resource` + `action` to
 * reach the Stripe-backed surface; omit both for the legacy local endpoints.
 * Throws AdminApiError carrying the server's message.
 */
export async function adminApi<T>(
  init: {
    method?: string;
    resource?: string;
    action?: string;
    query?: Query;
    body?: Record<string, unknown>;
  } = {}
): Promise<T> {
  const params = new URLSearchParams();
  if (init.resource) params.set('resource', init.resource);
  if (init.action) params.set('action', init.action);
  for (const [key, value] of Object.entries(init.query ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();

  const res = await fetch(`/api/admin${qs ? `?${qs}` : ''}`, {
    method: init.method ?? 'GET',
    credentials: 'same-origin',
    headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new AdminApiError(res.status, data.error ?? `Request failed (${res.status})`);
  return data;
}

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

export interface OrderDetail extends MergedOrder {
  refundedAmount: number;
  refunds: Array<{ id: string; amount: number; status: string | null; created: number; reason: string | null }>;
  paymentIntent: {
    id: string;
    status: string;
    amount: number;
    amountReceived: number;
    latestChargeId: string | null;
  } | null;
  subscription: { id: string; status: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: number | null } | null;
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

export interface AdminAction {
  id: string;
  at: string;
  email: string | null;
  resource: string;
  action: string;
  target: string | null;
  amount: number | null;
  reason: string | null;
  result: string;
  detail?: string | null;
}

export interface OrderListResponse {
  orders: MergedOrder[];
  hasMore: boolean;
  nextCursor: string | null;
}

/** Format satang as a THB string, e.g. 5000 → "฿50". */
export function baht(satang: number | null | undefined): string {
  return `฿${Math.round((satang ?? 0) / 100).toLocaleString()}`;
}

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
  defaultPaymentMethod: {
    id: string;
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
  } | null;
  discount: {
    couponId: string | null;
    percentOff: number | null;
    amountOff: number | null;
    currency: string | null;
    duration: string | null;
  } | null;
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

export interface SubscriptionListResponse {
  subscriptions: SubscriptionRow[];
  hasMore: boolean;
  nextCursor: string | null;
}

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
  paymentMethods: Array<{
    id: string;
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    description: string | null;
  }>;
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

export interface CustomerListResponse {
  customers: CustomerRow[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface RecurringPriceOption {
  priceId: string;
  productName: string | null;
  unitAmount: number | null;
  currency: string;
  interval: string | null;
  intervalCount: number | null;
  nickname: string | null;
}

export interface AdminPrice {
  id: string;
  unitAmount: number | null;
  currency: string;
  nickname: string | null;
  active: boolean;
  type: 'one_time' | 'recurring';
  recurring: { interval: string; intervalCount: number } | null;
  metadata: Record<string, string>;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  images: string[];
  metadata: Record<string, string>;
  appId: string | null;
  category: string | null;
  hidden: boolean;
  createdAt: string;
  defaultPriceId: string | null;
  prices: AdminPrice[];
}

export interface ProductListResponse {
  products: AdminProduct[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface AdminCoupon {
  id: string;
  name: string | null;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  valid: boolean;
  redeemBy: string | null;
  createdAt: string;
  promotionCodeCount: number;
  metadata: Record<string, string>;
}

export interface AdminPromotionCode {
  id: string;
  code: string;
  couponId: string;
  couponName: string | null;
  active: boolean;
  timesRedeemed: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CouponListResponse {
  coupons: AdminCoupon[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface PromotionCodeListResponse {
  promotionCodes: AdminPromotionCode[];
  hasMore: boolean;
  nextCursor: string | null;
}

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

export interface InvoiceListResponse {
  invoices: AdminInvoice[];
  hasMore: boolean;
  nextCursor: string | null;
}

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

export interface DisputeListResponse {
  disputes: AdminDispute[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface AdminPayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string | null;
  created: string;
  method: string;
  type: string;
  description: string | null;
  statementDescriptor: string | null;
  failureMessage: string | null;
  reversed: boolean;
  automatic: boolean;
  canCancel: boolean;
}

export interface PayoutListResponse {
  payouts: AdminPayout[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface BalanceResponse {
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
}

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
  summary: string;
}

export interface EventListResponse {
  events: AdminEvent[];
  hasMore: boolean;
  nextCursor: string | null;
}
