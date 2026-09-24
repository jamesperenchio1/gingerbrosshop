import { useCallback, useEffect, useState } from 'react';
import { Ban, CreditCard, Link2, Pause, Play, Plus, RefreshCw, Repeat, Search, X } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import {
  adminApi,
  baht,
  type RecurringPriceOption,
  type SubscriptionDetail,
  type SubscriptionListResponse,
  type SubscriptionRow,
} from './api';
import ConfirmActionDialog from './ConfirmActionDialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'past_due', label: 'Past due' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'paused', label: 'Paused' },
];

export default function SubscriptionsTab() {
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(
    async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi<SubscriptionListResponse>({
          resource: 'subscriptions',
          action: 'list',
          query: {
            limit: 25,
            email: emailFilter.trim() || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
            cursor: opts.reset ? undefined : opts.cursor ?? undefined,
          },
        });
        setSubs((prev) => (opts.reset ? data.subscriptions : [...prev, ...data.subscriptions]));
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    },
    [emailFilter, statusFilter]
  );

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load({ reset: true });
  };

  return (
    <div>
      <form onSubmit={onSubmitSearch} className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-earth/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="Search by customer email"
            className="w-full bg-cream border border-soft-peach rounded-lg pl-9 pr-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-accent-green text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown transition-colors"
        >
          <Plus className="w-4 h-4" />
          New subscription
        </button>
      </form>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {loading && subs.length === 0 && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
        </div>
      )}

      {!loading && subs.length === 0 && !error && (
        <div className="text-center py-16">
          <Repeat className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No subscriptions found.</p>
        </div>
      )}

      <div className="bg-cream rounded-2xl overflow-hidden">
        {subs.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedId(sub.id)}
            className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-semibold text-deep-brown truncate">{sub.itemsLabel}</span>
                <StatusBadge status={sub.status} />
                {sub.cancelAtPeriodEnd && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust/10 text-rust">
                    Cancels at end
                  </span>
                )}
                {sub.paused && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-earth/10 text-earth">
                    Paused
                  </span>
                )}
              </div>
              <p className="font-body text-earth text-[13px] truncate">
                {sub.customerName ?? 'Customer'} · {sub.customerEmail ?? sub.customerId ?? '—'}
              </p>
              <p className="font-body text-earth/60 text-[12px] mt-0.5">
                {sub.interval ? `${sub.intervalCount && sub.intervalCount > 1 ? `${sub.intervalCount} ` : ''}${sub.interval}ly` : 'one-time'}
                {sub.currentPeriodEnd ? ` · renews ${new Date(sub.currentPeriodEnd * 1000).toLocaleDateString('en-GB')}` : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-semibold text-deep-brown">{baht(sub.amount)}</p>
              <p className="font-body text-earth text-[12px]">{sub.itemCount} item{sub.itemCount !== 1 ? 's' : ''}</p>
            </div>
          </button>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => load({ cursor })}
            disabled={loading}
            className="font-body text-sm text-deep-brown hover:text-rust underline disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {selectedId && (
        <SubscriptionDetailPanel
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load({ reset: true })}
        />
      )}
      {creating && (
        <CreateSubscriptionPanel
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load({ reset: true });
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'active' || status === 'trialing'
      ? 'bg-accent-green/15 text-accent-green'
      : status === 'past_due' || status === 'unpaid' || status === 'incomplete'
        ? 'bg-rust/10 text-rust'
        : 'bg-earth/10 text-earth';
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${tone}`}>{status}</span>;
}

function SubscriptionDetailPanel({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'cancel' | 'cancel-end' | 'pause' | 'resume' | 'items' | null>(null);
  const [editingItems, setEditingItems] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { subscription } = await adminApi<{ subscription: SubscriptionDetail }>({
        resource: 'subscriptions',
        action: 'get',
        query: { id },
      });
      setDetail(subscription);
      const q: Record<string, number> = {};
      for (const item of subscription.items) q[item.id] = item.quantity ?? 1;
      setQuantities(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (body: Record<string, unknown>, successMessage: string) => {
    setBusy(true);
    setMessage('');
    try {
      await adminApi({ resource: 'subscriptions', method: 'POST', body: { ...body, id } });
      setMessage(successMessage);
      await load();
      onChanged();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
      return false;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-warm-white overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-warm-white border-b border-soft-peach/60 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-deep-brown">Subscription</h2>
            <p className="font-body text-earth text-[12px]">{detail?.customerEmail ?? id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-earth hover:text-deep-brown">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="mx-5 mt-4 font-body text-[13px] text-rust">{error}</p>}
        {message && <p className="mx-5 mt-4 font-body text-[13px] text-accent-green">{message}</p>}

        {detail && (
          <div className="px-5 py-5 space-y-5">
            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <Row label="Status" value={detail.status} />
              <Row label="Amount" value={`${baht(detail.amount)}${detail.interval ? ` / ${detail.interval}` : ''}`} />
              <Row label="Items" value={detail.itemsLabel} />
              {detail.currentPeriodEnd && (
                <Row label="Current period ends" value={new Date(detail.currentPeriodEnd * 1000).toLocaleString('en-GB')} />
              )}
              {detail.trialEnd && <Row label="Trial ends" value={new Date(detail.trialEnd * 1000).toLocaleString('en-GB')} />}
              {detail.cancelAtPeriodEnd && detail.cancelAt && (
                <Row label="Cancels" value={new Date(detail.cancelAt * 1000).toLocaleString('en-GB')} />
              )}
              {detail.paused && <Row label="Paused" value="Collection paused" />}
              <Row label="ID" value={detail.id} copy />
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <h3 className="font-display text-deep-brown">Customer</h3>
              <Row label="Name" value={detail.customer?.name ?? '—'} />
              <Row label="Email" value={detail.customer?.email ?? '—'} />
              <Row label="Phone" value={detail.customer?.phone ?? '—'} />
              {detail.customer && <Row label="Customer ID" value={detail.customer.id} copy />}
            </section>

            <section className="bg-cream rounded-2xl p-4">
              <h3 className="font-display text-deep-brown mb-2">Items</h3>
              {detail.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-soft-peach/40 last:border-0">
                  <span className="font-body text-[14px] text-deep-brown">
                    {item.quantity ?? 1}× {item.productName ?? item.priceId ?? 'Item'}
                  </span>
                  <span className="font-body text-[13px] text-earth">{baht((item.unitAmount ?? 0) * (item.quantity ?? 1))}</span>
                </div>
              ))}
            </section>

            {detail.defaultPaymentMethod && (
              <section className="bg-cream rounded-2xl p-4 space-y-2">
                <h3 className="font-display text-deep-brown flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payment method
                </h3>
                <Row
                  label="Card"
                  value={`${detail.defaultPaymentMethod.brand ?? 'card'} •••• ${detail.defaultPaymentMethod.last4 ?? '????'}${
                    detail.defaultPaymentMethod.expMonth
                      ? ` (${String(detail.defaultPaymentMethod.expMonth).padStart(2, '0')}/${detail.defaultPaymentMethod.expYear})`
                      : ''
                  }`}
                />
              </section>
            )}

            {detail.discount && (
              <section className="bg-cream rounded-2xl p-4 space-y-2">
                <h3 className="font-display text-deep-brown">Discount</h3>
                <Row
                  label="Coupon"
                  value={
                    detail.discount.percentOff != null
                      ? `${detail.discount.percentOff}% off`
                      : detail.discount.amountOff != null
                        ? `${baht(detail.discount.amountOff)} off`
                        : detail.discount.couponId ?? '—'
                  }
                />
              </section>
            )}

            {detail.latestInvoice && (
              <section className="bg-cream rounded-2xl p-4 space-y-2">
                <h3 className="font-display text-deep-brown">Latest invoice</h3>
                <Row label="Status" value={detail.latestInvoice.status ?? '—'} />
                <Row label="Paid" value={baht(detail.latestInvoice.amountPaid)} />
                {detail.latestInvoice.hostedInvoiceUrl && (
                  <a
                    href={detail.latestInvoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body text-sm text-deep-brown hover:text-rust underline"
                  >
                    View invoice
                  </a>
                )}
              </section>
            )}

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <h3 className="font-display text-deep-brown">Manage</h3>
              <div className="flex flex-wrap gap-2">
                {!detail.cancelAtPeriodEnd && detail.status !== 'canceled' && (
                  <button
                    onClick={() => setDialog('cancel-end')}
                    disabled={busy}
                    className="flex items-center gap-2 border border-rust text-rust font-body text-sm px-4 py-2 rounded-lg hover:bg-rust/10 disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" /> Cancel at period end
                  </button>
                )}
                {detail.status !== 'canceled' && (
                  <button
                    onClick={() => setDialog('cancel')}
                    disabled={busy}
                    className="flex items-center gap-2 bg-rust text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" /> Cancel now
                  </button>
                )}
                {detail.paused ? (
                  <button
                    onClick={() => setDialog('resume')}
                    disabled={busy}
                    className="flex items-center gap-2 border border-deep-brown text-deep-brown font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown/10 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" /> Resume
                  </button>
                ) : (
                  <button
                    onClick={() => setDialog('pause')}
                    disabled={busy || detail.status !== 'active'}
                    className="flex items-center gap-2 border border-deep-brown text-deep-brown font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown/10 disabled:opacity-50"
                  >
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                )}
                <button
                  onClick={() => setEditingItems(true)}
                  disabled={busy}
                  className="flex items-center gap-2 border border-deep-brown text-deep-brown font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown/10 disabled:opacity-50"
                >
                  <Repeat className="w-4 h-4" /> Update quantities
                </button>
              </div>
            </section>
          </div>
        )}

        {dialog === 'cancel-end' && detail && (
          <ConfirmActionDialog
            title="Cancel at period end"
            description="The customer keeps access until the current period ends, then billing stops."
            confirmPhrase={detail.id}
            requireReason
            busy={busy}
            confirmLabel="Schedule cancellation"
            onCancel={() => setDialog(null)}
            onConfirm={async ({ confirm, reason }) => {
              const ok = await post({ action: 'cancel', confirm, reason, atPeriodEnd: true }, 'Cancellation scheduled.');
              if (ok) setDialog(null);
            }}
          />
        )}

        {dialog === 'cancel' && detail && (
          <ConfirmActionDialog
            title="Cancel subscription now"
            description="Billing stops immediately and access ends. This cannot be undone."
            confirmPhrase={detail.id}
            requireReason
            busy={busy}
            confirmLabel="Cancel now"
            onCancel={() => setDialog(null)}
            onConfirm={async ({ confirm, reason }) => {
              const ok = await post({ action: 'cancel', confirm, reason }, 'Subscription cancelled.');
              if (ok) setDialog(null);
            }}
          />
        )}

        {dialog === 'pause' && detail && (
          <ConfirmActionDialog
            title="Pause collection"
            description="Stops collecting payment while leaving the subscription in place."
            confirmPhrase={detail.id}
            requireReason
            busy={busy}
            confirmLabel="Pause"
            onCancel={() => setDialog(null)}
            onConfirm={async ({ confirm, reason }) => {
              const ok = await post({ action: 'pause', confirm, reason }, 'Subscription paused.');
              if (ok) setDialog(null);
            }}
          />
        )}

        {dialog === 'resume' && detail && (
          <ConfirmActionDialog
            title="Resume collection"
            description="Resumes collecting payment on this subscription."
            confirmPhrase={detail.id}
            busy={busy}
            confirmLabel="Resume"
            onCancel={() => setDialog(null)}
            onConfirm={async ({ confirm }) => {
              const ok = await post({ action: 'resume', confirm }, 'Subscription resumed.');
              if (ok) setDialog(null);
            }}
          />
        )}

        {dialog === 'items' && detail && (
          <ConfirmActionDialog
            title="Update quantities"
            description={
              <span>
                New quantities:{' '}
                {detail.items
                  .map((i) => `${i.productName ?? i.id} = ${quantities[i.id] ?? 1}`)
                  .join(', ')}
              </span>
            }
            confirmPhrase={detail.id}
            requireReason
            busy={busy}
            confirmLabel="Update"
            onCancel={() => setDialog(null)}
            onConfirm={async ({ confirm, reason }) => {
              const items = detail.items.map((i) => ({ id: i.id, quantity: quantities[i.id] ?? 1 }));
              const ok = await post(
                { action: 'update-items', confirm, reason, items, prorationBehavior: 'create_prorations' },
                'Quantities updated.'
              );
              if (ok) setDialog(null);
            }}
          />
        )}

        {editingItems && detail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl">
              <h3 className="font-display text-lg text-deep-brown">Update quantities</h3>
              <div className="mt-3 space-y-2">
                {detail.items.map((item) => (
                  <label key={item.id} className="flex items-center justify-between gap-3">
                    <span className="font-body text-[13px] text-earth truncate">
                      {item.productName ?? item.priceId ?? item.id}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={quantities[item.id] ?? 1}
                      onChange={(e) =>
                        setQuantities((prev) => ({ ...prev, [item.id]: Math.max(0, Number(e.target.value)) }))
                      }
                      className="w-20 bg-cream border border-soft-peach rounded-lg px-2 py-1 font-body text-deep-brown text-sm"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setEditingItems(false)} className="font-body text-sm px-4 py-2 rounded-lg text-earth hover:text-deep-brown">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEditingItems(false);
                    setDialog('items');
                  }}
                  className="font-body text-sm px-4 py-2 rounded-lg bg-deep-brown text-cream hover:bg-rust"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateSubscriptionPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [prices, setPrices] = useState<RecurringPriceOption[]>([]);
  const [priceId, setPriceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerId, setCustomerId] = useState('');
  const [email, setEmail] = useState('');
  const [trialDays, setTrialDays] = useState(0);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [cards, setCards] = useState<Array<{ id: string; brand: string | null; last4: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi<{ prices: RecurringPriceOption[] }>({
          resource: 'subscriptions',
          action: 'prices',
        });
        if (cancelled) return;
        setPrices(data.prices);
        if (data.prices[0]) setPriceId(data.prices[0].priceId);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load prices');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadCards = async () => {
    if (!customerId.trim()) return;
    try {
      const data = await adminApi<{ paymentMethods: Array<{ id: string; brand: string | null; last4: string | null }> }>({
        resource: 'subscriptions',
        action: 'payment-methods',
        query: { customerId: customerId.trim() },
      });
      setCards(data.paymentMethods);
      if (data.paymentMethods[0]) setPaymentMethodId(data.paymentMethods[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    }
  };

  const createCheckout = async () => {
    if (!priceId) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const origin = window.location.origin;
      const data = await adminApi<{ sessionId: string; url: string | null }>({
        resource: 'subscriptions',
        method: 'POST',
        body: {
          action: 'create-checkout',
          priceId,
          quantity,
          customerId: customerId.trim() || undefined,
          email: email.trim() || undefined,
          trialDays: trialDays || undefined,
          successUrl: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/admin/orders?tab=subscriptions`,
        },
      });
      setMessage(data.url ? `Checkout link ready: ${data.url}` : `Checkout session ${data.sessionId} created (no URL).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout link');
    } finally {
      setBusy(false);
    }
  };

  const createDirect = async () => {
    if (!priceId || !customerId.trim()) {
      setError('A customer ID is required for direct creation.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await adminApi<{ id: string; status: string }>({
        resource: 'subscriptions',
        method: 'POST',
        body: {
          action: 'create-direct',
          confirm: customerId.trim(),
          priceId,
          quantity,
          customerId: customerId.trim(),
          paymentMethodId: paymentMethodId || undefined,
          trialDays: trialDays || undefined,
        },
      });
      setMessage(`Subscription ${data.id} created (${data.status}).`);
      setConfirming(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-warm-white overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-warm-white border-b border-soft-peach/60 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-deep-brown">New subscription</h2>
          <button onClick={onClose} className="p-2 text-earth hover:text-deep-brown">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {error && <p className="font-body text-[13px] text-rust">{error}</p>}
              {message && <p className="font-body text-[13px] text-accent-green break-all">{message}</p>}

              <label className="block">
                <span className="font-body text-[13px] text-earth">Plan (recurring price)</span>
                <select
                  value={priceId}
                  onChange={(e) => setPriceId(e.target.value)}
                  className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm"
                >
                  {prices.length === 0 && <option value="">No recurring prices found</option>}
                  {prices.map((p) => (
                    <option key={p.priceId} value={p.priceId}>
                      {p.productName ?? p.nickname ?? p.priceId} — {baht(p.unitAmount)}
                      {p.interval ? ` / ${p.interval}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-3">
                <label className="block flex-1">
                  <span className="font-body text-[13px] text-earth">Quantity</span>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm"
                  />
                </label>
                <label className="block flex-1">
                  <span className="font-body text-[13px] text-earth">Trial days (optional)</span>
                  <input
                    type="number"
                    min={0}
                    value={trialDays}
                    onChange={(e) => setTrialDays(Math.max(0, Number(e.target.value)))}
                    className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-body text-[13px] text-earth">Customer ID (optional for link)</span>
                <div className="flex gap-2 mt-1">
                  <input
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="cus_…"
                    className="flex-1 bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm"
                  />
                  <button
                    onClick={loadCards}
                    className="font-body text-sm px-3 py-2 rounded-lg border border-soft-peach text-deep-brown hover:bg-cream"
                  >
                    Load cards
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="font-body text-[13px] text-earth">Email (optional, for link when no customer)</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm"
                />
              </label>

              {cards.length > 0 && (
                <label className="block">
                  <span className="font-body text-[13px] text-earth">Card for direct create</span>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.brand ?? 'card'} •••• {c.last4 ?? '????'} ({c.id})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={createCheckout}
                  disabled={busy || !priceId}
                  className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust disabled:opacity-50"
                >
                  <Link2 className="w-4 h-4" /> Create checkout link
                </button>
                <button
                  onClick={() => setConfirming(true)}
                  disabled={busy || !priceId || !customerId.trim()}
                  className="flex items-center gap-2 bg-accent-green text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Create directly
                </button>
              </div>
              <p className="font-body text-earth/60 text-[11px]">
                A checkout link is safe to send and never charges until the customer completes it. Direct
                creation charges the card on file immediately.
              </p>
            </>
          )}
        </div>

        {confirming && (
          <ConfirmActionDialog
            title="Create subscription directly"
            description="This starts a real subscription and charges the saved payment method on file."
            confirmPhrase={customerId.trim()}
            busy={busy}
            confirmLabel="Create subscription"
            onCancel={() => setConfirming(false)}
            onConfirm={createDirect}
          />
        )}
      </div>
    </div>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-body text-[13px] text-earth/70 shrink-0">{label}</span>
      <span className="font-body text-[13px] text-deep-brown text-right break-all">
        {value}
        {copy && <CopyButton value={value} />}
      </span>
    </div>
  );
}
