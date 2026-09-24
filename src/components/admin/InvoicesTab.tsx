import { useCallback, useEffect, useState } from 'react';
import { FileText, RefreshCw, Search, Send, X } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import {
  adminApi,
  baht,
  type AdminInvoice,
  type AdminInvoiceDetail,
  type InvoiceListResponse,
} from './api';
import ConfirmActionDialog from './ConfirmActionDialog';

const STATUSES = ['draft', 'open', 'paid', 'uncollectible', 'void'] as const;

function statusClass(status: string | null): string {
  switch (status) {
    case 'paid':
      return 'bg-accent-green/15 text-accent-green';
    case 'open':
      return 'bg-rust/15 text-rust';
    case 'draft':
      return 'bg-earth/15 text-earth';
    default:
      return 'bg-earth/10 text-earth/70';
  }
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(
    async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi<InvoiceListResponse>({
          resource: 'invoices',
          action: 'list',
          query: {
            limit: 25,
            email: emailFilter.trim() || undefined,
            status: status || undefined,
            cursor: opts.reset ? undefined : opts.cursor ?? undefined,
          },
        });
        setInvoices((prev) => (opts.reset ? res.invoices : [...prev, ...res.invoices]));
        setHasMore(res.hasMore);
        setCursor(res.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    },
    [emailFilter, status],
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
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-earth/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="Search by email"
            className="w-full bg-cream border border-soft-peach rounded-lg pl-9 pr-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="flex items-center gap-2 bg-rust text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown transition-colors"
        >
          <Search className="w-4 h-4" /> Search
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

      {!loading && invoices.length === 0 && !error && (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No invoices found.</p>
        </div>
      )}

      {invoices.length > 0 && (
        <div className="bg-cream rounded-2xl overflow-hidden">
          {invoices.map((invoice) => (
            <button
              key={invoice.id}
              onClick={() => setSelectedId(invoice.id)}
              className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-deep-brown truncate">
                    {invoice.number ?? invoice.id}
                  </span>
                  <span
                    className={`text-[11px] font-body px-2 py-0.5 rounded-full ${statusClass(invoice.status)}`}
                  >
                    {invoice.status ?? 'unknown'}
                  </span>
                </div>
                <div className="font-body text-[13px] text-earth/80 mt-0.5 truncate">
                  {invoice.customerEmail ?? invoice.customerName ?? 'No customer'} ·{' '}
                  {new Date(invoice.created).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-deep-brown">{baht(invoice.amountDue)}</div>
                {invoice.paid && (
                  <div className="font-body text-[12px] text-accent-green">Paid</div>
                )}
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
        <InvoiceDetailPanel
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load({ reset: true })}
        />
      )}
    </div>
  );
}

function InvoiceDetailPanel({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [invoice, setInvoice] = useState<AdminInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'send' | 'void' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { invoice: detail } = await adminApi<{ invoice: AdminInvoiceDetail }>({
        resource: 'invoices',
        action: 'get',
        query: { id },
      });
      setInvoice(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action: 'send' | 'void', confirm: string, reason: string) {
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'invoices',
        method: 'POST',
        body: { action, id, confirm, reason },
      });
      setDialog(null);
      setMessage(action === 'send' ? 'Invoice sent.' : 'Invoice voided.');
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
          <h2 className="font-display text-lg text-deep-brown truncate">
            {invoice?.number ?? 'Invoice'}
          </h2>
          <button onClick={onClose} className="p-2 text-earth hover:text-deep-brown">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
          </div>
        ) : !invoice ? (
          <p className="px-5 py-6 font-body text-[13px] text-rust">{error || 'Not found'}</p>
        ) : (
          <div className="px-5 py-5 space-y-5">
            {error && <p className="font-body text-[13px] text-rust">{error}</p>}
            {message && <p className="font-body text-[13px] text-accent-green">{message}</p>}

            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">Invoice</h3>
                <CopyButton value={invoice.id} />
              </div>
              <Row label="Status" value={invoice.status ?? '—'} />
              <Row label="Amount due" value={baht(invoice.amountDue)} />
              <Row label="Amount paid" value={baht(invoice.amountPaid)} />
              <Row label="Amount remaining" value={baht(invoice.amountRemaining)} />
              <Row label="Subtotal" value={baht(invoice.subtotal)} />
              <Row label="Tax" value={baht(invoice.tax)} />
              <Row label="Total" value={baht(invoice.total)} />
              <Row label="Created" value={new Date(invoice.created).toLocaleDateString()} />
              {invoice.dueDate && (
                <Row label="Due" value={new Date(invoice.dueDate).toLocaleDateString()} />
              )}
              <Row label="Attempts" value={String(invoice.attemptCount)} />
              {invoice.nextPaymentAttempt && (
                <Row
                  label="Next attempt"
                  value={new Date(invoice.nextPaymentAttempt).toLocaleDateString()}
                />
              )}
              {invoice.description && <Row label="Description" value={invoice.description} />}
              {invoice.customerEmail && <Row label="Customer" value={invoice.customerEmail} />}
              {invoice.subscriptionId && (
                <Row label="Subscription" value={invoice.subscriptionId} copy />
              )}
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <h3 className="font-display text-deep-brown">Lines</h3>
              {invoice.lines.length === 0 && (
                <p className="font-body text-[13px] text-earth/70">No line items.</p>
              )}
              <div className="space-y-2">
                {invoice.lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-start justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-soft-peach/50"
                  >
                    <div className="min-w-0">
                      <div className="font-body text-sm text-deep-brown">
                        {line.description ?? 'Item'}
                      </div>
                      {line.quantity != null && (
                        <div className="font-body text-[12px] text-earth/70">
                          Qty {line.quantity}
                        </div>
                      )}
                    </div>
                    <span className="font-body text-sm text-deep-brown shrink-0">
                      {baht(line.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {(invoice.hostedInvoiceUrl || invoice.invoicePdf) && (
              <section className="bg-cream rounded-2xl p-4 space-y-2">
                <h3 className="font-display text-deep-brown">Links</h3>
                {invoice.hostedInvoiceUrl && (
                  <a
                    href={invoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block font-body text-[13px] text-rust hover:text-deep-brown underline break-all"
                  >
                    Hosted invoice
                  </a>
                )}
                {invoice.invoicePdf && (
                  <a
                    href={invoice.invoicePdf}
                    target="_blank"
                    rel="noreferrer"
                    className="block font-body text-[13px] text-rust hover:text-deep-brown underline break-all"
                  >
                    PDF
                  </a>
                )}
              </section>
            )}

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <h3 className="font-display text-deep-brown">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setDialog('send')}
                  disabled={busy || !invoice.canSend}
                  className="flex items-center gap-2 font-body text-sm bg-deep-brown text-cream px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" /> Send invoice
                </button>
                <button
                  onClick={() => setDialog('void')}
                  disabled={busy || !invoice.canVoid}
                  className="flex items-center gap-2 font-body text-sm text-rust hover:text-deep-brown disabled:opacity-40"
                >
                  Void invoice
                </button>
              </div>
              {!invoice.canSend && !invoice.canVoid && (
                <p className="font-body text-[12px] text-earth/70">
                  This invoice is {invoice.status ?? 'final'} and can no longer be sent or voided.
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      {dialog === 'send' && invoice && (
        <ConfirmActionDialog
          title="Send invoice"
          description="This emails the invoice to the customer and finalizes it."
          confirmPhrase={invoice.id}
          requireReason
          busy={busy}
          confirmLabel="Send"
          onCancel={() => setDialog(null)}
          onConfirm={({ confirm, reason }) => runAction('send', confirm, reason)}
        />
      )}
      {dialog === 'void' && invoice && (
        <ConfirmActionDialog
          title="Void invoice"
          description="This voids the invoice. It cannot be undone."
          confirmPhrase={invoice.id}
          requireReason
          busy={busy}
          confirmLabel="Void"
          onCancel={() => setDialog(null)}
          onConfirm={({ confirm, reason }) => runAction('void', confirm, reason)}
        />
      )}
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
