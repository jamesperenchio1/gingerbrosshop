import { useCallback, useEffect, useState } from 'react';
import { CreditCard, RefreshCw, Search, Users, X } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import {
  adminApi,
  baht,
  type CustomerDetail,
  type CustomerListResponse,
  type CustomerRow,
} from './api';
import ConfirmActionDialog from './ConfirmActionDialog';

export default function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(
    async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi<CustomerListResponse>({
          resource: 'customers',
          action: 'list',
          query: {
            limit: 25,
            email: emailFilter.trim() || undefined,
            cursor: opts.reset ? undefined : opts.cursor ?? undefined,
          },
        });
        setCustomers((prev) => (opts.reset ? data.customers : [...prev, ...data.customers]));
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    },
    [emailFilter]
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
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-earth/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="Search by email"
            className="w-full bg-cream border border-soft-peach rounded-lg pl-9 pr-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </form>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {loading && customers.length === 0 && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
        </div>
      )}

      {!loading && customers.length === 0 && !error && (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No customers found.</p>
        </div>
      )}

      <div className="bg-cream rounded-2xl overflow-hidden">
        {customers.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-semibold text-deep-brown truncate">{c.name ?? 'Unnamed'}</span>
                {c.delinquent && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust/10 text-rust">
                    Delinquent
                  </span>
                )}
                {c.subscriptionCount > 0 && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green">
                    {c.subscriptionCount} sub{c.subscriptionCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="font-body text-earth text-[13px] truncate">{c.email ?? 'No email'}</p>
              <p className="font-body text-earth/60 text-[12px] mt-0.5">
                Since {new Date(c.created * 1000).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="text-right shrink-0">
              {c.storeCredit > 0 && <p className="font-body text-[12px] text-accent-green">{baht(c.storeCredit)} credit</p>}
              <p className="font-body text-earth text-[12px]">{c.phone ?? ''}</p>
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
        <CustomerDetailPanel
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load({ reset: true })}
        />
      )}
    </div>
  );
}

function CustomerDetailPanel({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editing, setEditing] = useState(false);

  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditDialog, setCreditDialog] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { customer } = await adminApi<{ customer: CustomerDetail }>({
        resource: 'customers',
        action: 'get',
        query: { id },
      });
      setDetail(customer);
      setName(customer.name ?? '');
      setEmail(customer.email ?? '');
      setPhone(customer.phone ?? '');
      setAddress(formatAddress(customer.address));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async (confirm: string) => {
    setBusy(true);
    setMessage('');
    try {
      await adminApi({
        resource: 'customers',
        method: 'POST',
        body: {
          action: 'update',
          id,
          confirm,
          name,
          email,
          phone,
          address: parseAddress(address),
        },
      });
      setMessage('Customer updated.');
      setEditing(false);
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setBusy(false);
    }
  };

  const grantCredit = async ({ confirm, reason, amount }: { confirm: string; reason: string; amount: string }) => {
    const target = detail?.email;
    if (!target) {
      setError('This customer has no email; store credit is keyed by email.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await adminApi({
        resource: 'customers',
        method: 'POST',
        body: {
          action: 'credit',
          email: target,
          amount: Math.round(Number(amount) * 100),
          confirm,
          reason,
        },
      });
      setMessage(`${baht(Math.round(Number(amount) * 100))} store credit adjusted for ${target}.`);
      setCreditDialog(false);
      setCreditAmount('');
      setCreditReason('');
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust credit');
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
            <h2 className="font-display text-lg text-deep-brown">{detail?.name ?? 'Customer'}</h2>
            <p className="font-body text-earth text-[12px]">{detail?.email ?? id}</p>
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
              <Row label="Store credit" value={baht(detail.storeCredit)} />
              <Row label="Stripe balance" value={baht(detail.stripeBalance)} />
              <Row label="Subscriptions" value={String(detail.subscriptionCount)} />
              <Row label="Customer ID" value={detail.id} copy />
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">Profile</h3>
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="font-body text-[13px] text-deep-brown hover:text-rust underline"
                >
                  {editing ? 'Close' : 'Edit'}
                </button>
              </div>
              {editing ? (
                <div className="space-y-2">
                  <Field label="Name" value={name} onChange={setName} />
                  <Field label="Email" value={email} onChange={setEmail} />
                  <Field label="Phone" value={phone} onChange={setPhone} />
                  <Field label="Address" value={address} onChange={setAddress} placeholder="line1, city, postal_code, country" />
                  <button
                    onClick={() => setEditing(false)}
                    className="font-body text-sm text-deep-brown hover:text-rust underline"
                  >
                    Discard changes
                  </button>
                </div>
              ) : (
                <>
                  <Row label="Name" value={detail.name ?? '—'} />
                  <Row label="Email" value={detail.email ?? '—'} />
                  <Row label="Phone" value={detail.phone ?? '—'} />
                  <Row label="Address" value={formatAddress(detail.address) || '—'} />
                </>
              )}
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <h3 className="font-display text-deep-brown">Store credit</h3>
              <Row label="Balance" value={baht(detail.storeCredit)} />
              <p className="font-body text-[12px] text-earth/80">
                Store credit is money you owe this customer — usually from a returned box or a goodwill
                gesture. It is saved against their email and automatically applied as a one-time discount
                at their next checkout, so they pay that much less. It is used up once redeemed.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCreditDialog(true)}
                  disabled={busy || !detail.email}
                  className="font-body text-sm px-4 py-2 rounded-lg bg-deep-brown text-cream hover:bg-rust disabled:opacity-50"
                >
                  Adjust credit
                </button>
              </div>
              <p className="font-body text-earth/60 text-[11px]">
                Enter a positive amount to add credit (e.g. 50 adds ฿50), or a negative amount to deduct.
                Every change is logged with a reason.
              </p>
            </section>

            {detail.subscriptions.length > 0 && (
              <section className="bg-cream rounded-2xl p-4">
                <h3 className="font-display text-deep-brown mb-2">Subscriptions</h3>
                {detail.subscriptions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-soft-peach/40 last:border-0">
                    <span className="font-body text-[13px] text-deep-brown">
                      {s.itemsLabel} · <span className="text-earth">{s.status}</span>
                    </span>
                    <span className="font-body text-[13px] text-earth">{baht(s.amount)}</span>
                  </div>
                ))}
              </section>
            )}

            {detail.paymentMethods.length > 0 && (
              <section className="bg-cream rounded-2xl p-4 space-y-2">
                <h3 className="font-display text-deep-brown flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Cards
                </h3>
                {detail.paymentMethods.map((pm) => (
                  <Row
                    key={pm.id}
                    label={`${pm.brand ?? 'card'} •••• ${pm.last4 ?? '????'}`}
                    value={pm.expMonth ? `${String(pm.expMonth).padStart(2, '0')}/${pm.expYear}` : ''}
                  />
                ))}
              </section>
            )}

            {detail.recentPayments.length > 0 && (
              <section className="bg-cream rounded-2xl p-4">
                <h3 className="font-display text-deep-brown mb-2">Recent payments</h3>
                {detail.recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-soft-peach/40 last:border-0">
                    <span className="font-body text-[12px] text-earth">
                      {new Date(p.created * 1000).toLocaleDateString('en-GB')} · {p.status}
                    </span>
                    <span className="font-body text-[13px] text-deep-brown">{baht(p.amount)}</span>
                  </div>
                ))}
              </section>
            )}

            {detail.invoices.length > 0 && (
              <section className="bg-cream rounded-2xl p-4">
                <h3 className="font-display text-deep-brown mb-2">Invoices</h3>
                {detail.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-soft-peach/40 last:border-0">
                    <span className="font-body text-[12px] text-earth">
                      {new Date(inv.created * 1000).toLocaleDateString('en-GB')} · {inv.status ?? '—'}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-body text-[13px] text-deep-brown">{baht(inv.amountPaid)}</span>
                      {inv.hostedInvoiceUrl && (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-body text-[12px] text-deep-brown hover:text-rust underline"
                        >
                          View
                        </a>
                      )}
                    </span>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        {editing && detail && (
          <ConfirmActionDialog
            title="Save customer profile"
            description="Updates the customer record in Stripe."
            confirmPhrase={detail.id}
            busy={busy}
            confirmLabel="Save"
            onCancel={() => setEditing(false)}
            onConfirm={async ({ confirm }) => saveProfile(confirm)}
          />
        )}

        {creditDialog && detail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl">
              <h3 className="font-display text-lg text-deep-brown">Adjust store credit</h3>
              <p className="mt-1 font-body text-[13px] text-earth">
                For {detail.email ?? 'customer'}. Positive adds, negative deducts.
              </p>
              <div className="mt-3 space-y-3">
                <Field label="Amount (THB)" value={creditAmount} onChange={setCreditAmount} placeholder="e.g. 50 or -50" />
                <Field label="Reason (logged)" value={creditReason} onChange={setCreditReason} />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setCreditDialog(false)}
                  disabled={busy}
                  className="font-body text-sm px-4 py-2 rounded-lg text-earth hover:text-deep-brown"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (Number(creditAmount) === 0 || creditReason.trim().length < 3) {
                      setError('Enter a non-zero amount and a reason (3+ chars).');
                      return;
                    }
                    setCreditDialog(false);
                    grantCredit({ confirm: detail.email ?? '', reason: creditReason.trim(), amount: creditAmount });
                  }}
                  disabled={busy}
                  className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
                >
                  {busy ? 'Working…' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-body text-[13px] text-earth">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
      />
    </label>
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

function formatAddress(address: Record<string, unknown> | null): string {
  if (!address) return '';
  const parts = [address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(
    (p) => typeof p === 'string' && p
  );
  return parts.join(', ');
}

function parseAddress(value: string): Record<string, string> | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(',').map((p) => p.trim());
  const address: Record<string, string> = { line1: parts[0] ?? '' };
  if (parts[1]) address.city = parts[1];
  if (parts[2]) address.postal_code = parts[2];
  if (parts[3]) address.country = parts[3];
  return address;
}
