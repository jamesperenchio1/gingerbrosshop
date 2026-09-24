import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Activity, Plus, RefreshCw, Wallet, X } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import {
  adminApi,
  baht,
  type AdminDispute,
  type AdminDisputeDetail,
  type AdminEvent,
  type AdminEventDetail,
  type AdminPayout,
  type BalanceResponse,
  type DisputeListResponse,
  type EventListResponse,
  type PayoutListResponse,
} from './api';
import ConfirmActionDialog from './ConfirmActionDialog';

type Section = 'disputes' | 'payouts' | 'events';

const SECTIONS: Array<{ id: Section; label: string; icon: typeof AlertTriangle }> = [
  { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
  { id: 'payouts', label: 'Payouts', icon: Wallet },
  { id: 'events', label: 'Events', icon: Activity },
];

export default function OpsTab() {
  const [section, setSection] = useState<Section>('disputes');

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-2 font-body text-sm px-4 py-2 rounded-lg border transition-colors ${
                section === s.id
                  ? 'bg-rust text-cream border-rust'
                  : 'bg-cream text-earth border-soft-peach hover:text-deep-brown'
              }`}
            >
              <Icon className="w-4 h-4" /> {s.label}
            </button>
          );
        })}
      </div>

      {section === 'disputes' && <DisputesSection />}
      {section === 'payouts' && <PayoutsSection />}
      {section === 'events' && <EventsSection />}
    </div>
  );
}

function statusBadgeClass(status: string): string {
  if (['won', 'paid', 'succeeded'].includes(status)) return 'bg-accent-green/15 text-accent-green';
  if (['lost', 'failed', 'canceled'].includes(status)) return 'bg-rust/15 text-rust';
  return 'bg-earth/15 text-earth';
}

function DisputesSection() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi<DisputeListResponse>({
        resource: 'ops',
        query: {
          section: 'disputes',
          action: 'list',
          limit: 25,
          cursor: opts.reset ? undefined : opts.cursor ?? undefined,
        },
      });
      setDisputes((prev) => (opts.reset ? res.disputes : [...prev, ...res.disputes]));
      setHasMore(res.hasMore);
      setCursor(res.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ reset: true });
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="font-body text-sm text-earth">
          {disputes.length} dispute{disputes.length === 1 ? '' : 's'}
        </span>
        <button
          onClick={() => load({ reset: true })}
          disabled={loading}
          className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {!loading && disputes.length === 0 && !error && (
        <div className="text-center py-16">
          <AlertTriangle className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No disputes. Good news.</p>
        </div>
      )}

      {disputes.length > 0 && (
        <div className="bg-cream rounded-2xl overflow-hidden">
          {disputes.map((dispute) => (
            <button
              key={dispute.id}
              onClick={() => setSelectedId(dispute.id)}
              className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-deep-brown">{baht(dispute.amount)}</span>
                  <span
                    className={`text-[11px] font-body px-2 py-0.5 rounded-full ${statusBadgeClass(dispute.status)}`}
                  >
                    {dispute.status}
                  </span>
                  {dispute.hasEvidence && (
                    <span className="text-[11px] font-body px-2 py-0.5 rounded-full bg-earth/15 text-earth">
                      Evidence
                    </span>
                  )}
                </div>
                <div className="font-body text-[13px] text-earth/80 mt-0.5 truncate">
                  {dispute.reason} · {new Date(dispute.created).toLocaleDateString()}
                  {dispute.evidenceDueBy
                    ? ` · due ${new Date(dispute.evidenceDueBy).toLocaleDateString()}`
                    : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-4">
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
        <DisputeDetailPanel
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load({ reset: true })}
        />
      )}
    </div>
  );
}

const EVIDENCE_FIELDS: Array<{ key: string; label: string; multiline?: boolean }> = [
  { key: 'uncategorized_text', label: 'Summary / explanation', multiline: true },
  { key: 'product_description', label: 'Product description', multiline: true },
  { key: 'customer_name', label: 'Customer name' },
  { key: 'customer_email_address', label: 'Customer email' },
  { key: 'billing_address', label: 'Billing address', multiline: true },
  { key: 'shipping_address', label: 'Shipping address', multiline: true },
  { key: 'service_date', label: 'Service date' },
  { key: 'shipping_tracking_number', label: 'Shipping tracking number' },
  { key: 'shipping_carrier', label: 'Shipping carrier' },
  { key: 'customer_communication', label: 'Customer communication', multiline: true },
  { key: 'cancellation_policy', label: 'Cancellation policy', multiline: true },
  { key: 'refund_policy', label: 'Refund policy', multiline: true },
  { key: 'access_activity_log', label: 'Access activity log', multiline: true },
];

function DisputeDetailPanel({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [dispute, setDispute] = useState<AdminDisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<'submit' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { dispute: detail } = await adminApi<{ dispute: AdminDisputeDetail }>({
        resource: 'ops',
        action: 'get',
        query: { section: 'disputes', id },
      });
      setDispute(detail);
      setFields(detail.evidence ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dispute');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function evidencePayload(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const f of EVIDENCE_FIELDS) {
      const v = (fields[f.key] ?? '').trim();
      if (v) out[f.key] = v;
    }
    return out;
  }

  async function save(submit: boolean, confirm?: string, reason?: string) {
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'ops',
        method: 'POST',
        body: {
          section: 'disputes',
          action: 'evidence',
          id,
          evidence: evidencePayload(),
          submit,
          confirm,
          reason,
        },
      });
      setDialog(null);
      setMessage(submit ? 'Evidence submitted.' : 'Evidence saved as draft.');
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
      setDialog(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-warm-white overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-warm-white border-b border-soft-peach/60 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-deep-brown truncate">Dispute</h2>
          <button onClick={onClose} className="p-2 text-earth hover:text-deep-brown">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
          </div>
        ) : !dispute ? (
          <p className="px-5 py-6 font-body text-[13px] text-rust">{error || 'Not found'}</p>
        ) : (
          <div className="px-5 py-5 space-y-5">
            {error && <p className="font-body text-[13px] text-rust">{error}</p>}
            {message && <p className="font-body text-[13px] text-accent-green">{message}</p>}

            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">Dispute</h3>
                <CopyButton value={dispute.id} />
              </div>
              <Row label="Amount" value={baht(dispute.amount)} />
              <Row label="Status" value={dispute.status} />
              <Row label="Reason" value={dispute.reason} />
              <Row label="Created" value={new Date(dispute.created).toLocaleDateString()} />
              {dispute.evidenceDueBy && (
                <Row
                  label="Evidence due"
                  value={new Date(dispute.evidenceDueBy).toLocaleDateString()}
                />
              )}
              <Row label="Submissions" value={String(dispute.submissionCount)} />
              {dispute.paymentIntentId && (
                <Row label="Payment intent" value={dispute.paymentIntentId} copy />
              )}
              {dispute.chargeId && <Row label="Charge" value={dispute.chargeId} copy />}
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <h3 className="font-display text-deep-brown">Evidence</h3>
              {dispute.evidenceDetails.pastDue && (
                <p className="font-body text-[13px] text-rust">
                  The evidence deadline has passed.
                </p>
              )}
              {EVIDENCE_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="font-body text-[13px] text-earth">{f.label}</span>
                  {f.multiline ? (
                    <textarea
                      value={fields[f.key] ?? ''}
                      onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      rows={2}
                      className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
                    />
                  ) : (
                    <input
                      value={fields[f.key] ?? ''}
                      onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
                    />
                  )}
                </label>
              ))}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => save(false)}
                  disabled={busy}
                  className="font-body text-sm bg-deep-brown text-cream px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  onClick={() => setDialog('submit')}
                  disabled={busy}
                  className="font-body text-sm bg-rust text-cream px-4 py-2 rounded-lg hover:bg-deep-brown transition-colors disabled:opacity-50"
                >
                  Submit evidence
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {dialog === 'submit' && dispute && (
        <ConfirmActionDialog
          title="Submit dispute evidence"
          description="This submits the evidence to Stripe for review. You cannot change it after submitting."
          confirmPhrase={dispute.id}
          requireReason
          busy={busy}
          confirmLabel="Submit"
          onCancel={() => setDialog(null)}
          onConfirm={({ confirm, reason }) => save(true, confirm, reason)}
        />
      )}
    </div>
  );
}

function PayoutsSection() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
    setLoading(true);
    setError('');
    try {
      const [list, bal] = await Promise.all([
        adminApi<PayoutListResponse>({
          resource: 'ops',
          query: {
            section: 'payouts',
            action: 'list',
            limit: 25,
            cursor: opts.reset ? undefined : opts.cursor ?? undefined,
          },
        }),
        adminApi<BalanceResponse>({
          resource: 'ops',
          query: { section: 'payouts', action: 'balance' },
        }),
      ]);
      setPayouts((prev) => (opts.reset ? list.payouts : [...prev, ...list.payouts]));
      setHasMore(list.hasMore);
      setCursor(list.nextCursor);
      setBalance(bal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ reset: true });
  }, [load]);

  return (
    <div>
      {balance && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-cream rounded-2xl p-4">
            <div className="font-body text-[13px] text-earth/70">Available</div>
            <div className="font-display text-lg text-deep-brown">
              {balance.available.map((b) => baht(b.amount)).join(', ') || baht(0)}
            </div>
          </div>
          <div className="bg-cream rounded-2xl p-4">
            <div className="font-body text-[13px] text-earth/70">Pending</div>
            <div className="font-display text-lg text-deep-brown">
              {balance.pending.map((b) => baht(b.amount)).join(', ') || baht(0)}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="font-body text-sm text-earth">
          {payouts.length} payout{payouts.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-rust text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown transition-colors"
          >
            <Plus className="w-4 h-4" /> Create payout
          </button>
          <button
            onClick={() => load({ reset: true })}
            disabled={loading}
            className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {!loading && payouts.length === 0 && !error && (
        <div className="text-center py-16">
          <Wallet className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No payouts found.</p>
        </div>
      )}

      {payouts.length > 0 && (
        <div className="bg-cream rounded-2xl overflow-hidden">
          {payouts.map((payout) => (
            <PayoutRow key={payout.id} payout={payout} onChanged={() => load({ reset: true })} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => load({ cursor })}
            disabled={loading}
            className="font-body text-sm text-deep-brown hover:text-rust underline disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {creating && (
        <CreatePayoutPanel
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

function PayoutRow({ payout, onChanged }: { payout: AdminPayout; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'cancel' | null>(null);
  const [error, setError] = useState('');

  async function cancelPayout(confirm: string, reason: string) {
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'ops',
        method: 'POST',
        body: { section: 'payouts', action: 'cancel', id: payout.id, confirm, reason },
      });
      setDialog(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
      setDialog(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-5 py-4 border-b border-soft-peach/50 last:border-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-deep-brown">{baht(payout.amount)}</span>
            <span
              className={`text-[11px] font-body px-2 py-0.5 rounded-full ${statusBadgeClass(payout.status)}`}
            >
              {payout.status}
            </span>
            {payout.automatic && (
              <span className="text-[11px] font-body px-2 py-0.5 rounded-full bg-earth/15 text-earth">
                Auto
              </span>
            )}
          </div>
          <div className="font-body text-[13px] text-earth/80 mt-0.5 truncate">
            {payout.type} · {new Date(payout.created).toLocaleDateString()}
            {payout.arrivalDate
              ? ` · arrives ${new Date(payout.arrivalDate).toLocaleDateString()}`
              : ''}
          </div>
          {payout.failureMessage && (
            <div className="font-body text-[12px] text-rust mt-0.5">{payout.failureMessage}</div>
          )}
          {error && <div className="font-body text-[12px] text-rust mt-0.5">{error}</div>}
        </div>
        {payout.canCancel && (
          <button
            onClick={() => setDialog('cancel')}
            disabled={busy}
            className="font-body text-[13px] text-rust hover:text-deep-brown shrink-0 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {dialog === 'cancel' && (
        <ConfirmActionDialog
          title="Cancel payout"
          description="This cancels the payout. The funds return to your balance."
          confirmPhrase={payout.id}
          requireReason
          busy={busy}
          confirmLabel="Cancel payout"
          onCancel={() => setDialog(null)}
          onConfirm={({ confirm, reason }) => cancelPayout(confirm, reason)}
        />
      )}
    </div>
  );
}

function CreatePayoutPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(false);

  async function submit(confirm: string, reason: string) {
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'ops',
        method: 'POST',
        body: {
          section: 'payouts',
          action: 'create',
          amount: Math.round(Number(amount) * 100),
          currency: 'thb',
          confirm,
          reason,
        },
      });
      setDialog(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create payout');
      setDialog(false);
    } finally {
      setBusy(false);
    }
  }

  function openConfirm() {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    setError('');
    setDialog(true);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-display text-lg text-deep-brown mb-4">Create payout</h3>
        {error && <p className="mb-3 font-body text-[13px] text-rust">{error}</p>}
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Amount (THB)</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="font-body text-sm px-4 py-2 rounded-lg text-earth hover:text-deep-brown"
          >
            Cancel
          </button>
          <button
            onClick={openConfirm}
            disabled={busy}
            className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>

      {dialog && (
        <ConfirmActionDialog
          title="Create payout"
          description={`Send ${baht(Math.round(Number(amount) * 100))} to your bank account.`}
          confirmPhrase="PAYOUT"
          requireReason
          busy={busy}
          confirmLabel="Create payout"
          onCancel={() => setDialog(false)}
          onConfirm={({ confirm, reason }) => submit(confirm, reason)}
        />
      )}
    </div>
  );
}

function EventsSection() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(
    async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi<EventListResponse>({
          resource: 'ops',
          query: {
            section: 'events',
            action: 'list',
            limit: 25,
            type: typeFilter.trim() || undefined,
            cursor: opts.reset ? undefined : opts.cursor ?? undefined,
          },
        });
        setEvents((prev) => (opts.reset ? res.events : [...prev, ...res.events]));
        setHasMore(res.hasMore);
        setCursor(res.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    },
    [typeFilter],
  );

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load({ reset: true });
        }}
        className="flex flex-wrap items-center gap-2 mb-4"
      >
        <input
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="Filter by type (e.g. charge.succeeded)"
          className="flex-1 min-w-[220px] bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-rust text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown transition-colors"
        >
          <Activity className="w-4 h-4" /> Filter
        </button>
        <button
          type="button"
          onClick={() => load({ reset: true })}
          disabled={loading}
          className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </form>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {!loading && events.length === 0 && !error && (
        <div className="text-center py-16">
          <Activity className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No events found.</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="bg-cream rounded-2xl overflow-hidden">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedId(event.id)}
              className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body text-sm text-deep-brown truncate">{event.type}</span>
                  {event.pendingWebhooks > 0 && (
                    <span className="text-[11px] font-body px-2 py-0.5 rounded-full bg-rust/15 text-rust">
                      {event.pendingWebhooks} pending
                    </span>
                  )}
                </div>
                <div className="font-body text-[13px] text-earth/80 mt-0.5 truncate">
                  {new Date(event.created).toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => load({ cursor })}
            disabled={loading}
            className="font-body text-sm text-deep-brown hover:text-rust underline disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {selectedId && <EventDetailPanel id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function EventDetailPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { event: detail } = await adminApi<{ event: AdminEventDetail }>({
        resource: 'ops',
        action: 'get',
        query: { section: 'events', id },
      });
      setEvent(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-warm-white overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-warm-white border-b border-soft-peach/60 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-deep-brown truncate">Event</h2>
          <button onClick={onClose} className="p-2 text-earth hover:text-deep-brown">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
          </div>
        ) : !event ? (
          <p className="px-5 py-6 font-body text-[13px] text-rust">{error || 'Not found'}</p>
        ) : (
          <div className="px-5 py-5 space-y-5">
            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">{event.type}</h3>
                <CopyButton value={event.id} />
              </div>
              <Row label="Summary" value={event.summary || '—'} />
              <Row label="Created" value={new Date(event.created).toLocaleString()} />
              <Row label="Livemode" value={event.livemode ? 'Yes' : 'No'} />
              {event.apiVersion && <Row label="API version" value={event.apiVersion} />}
              {event.requestId && <Row label="Request ID" value={event.requestId} copy />}
              <Row label="Pending webhooks" value={String(event.pendingWebhooks)} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-body text-[13px] text-earth/70 shrink-0">{label}</span>
      <span className="font-body text-[13px] text-deep-brown text-right break-all">{value}</span>
      {copy && <CopyButton value={value} />}
    </div>
  );
}
