import { useCallback, useEffect, useState } from 'react';
import { X, Truck, Gift, ExternalLink, Ban, Undo2 } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { adminApi, baht, type OrderDetail } from './api';
import ConfirmActionDialog from './ConfirmActionDialog';

type DialogKind = 'refund' | 'cancel' | null;

export default function OrderDetailPanel({
  sessionId,
  onClose,
  onChanged,
}: {
  sessionId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [note, setNote] = useState('');
  const [dialog, setDialog] = useState<DialogKind>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { order } = await adminApi<{ order: OrderDetail }>({
        resource: 'orders',
        action: 'get',
        query: { id: sessionId },
      });
      setDetail(order);
      setTrackingNumber(order.trackingNumber ?? '');
      setTrackingCarrier(order.trackingCarrier ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (body: Record<string, unknown>, successMessage: string) => {
    setBusy(true);
    setMessage('');
    try {
      await adminApi({ resource: 'orders', method: 'POST', body: { ...body, sessionId } });
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

  const saveTracking = async () => {
    if (!trackingNumber.trim()) return;
    await post(
      { action: 'tracking', trackingNumber: trackingNumber.trim(), trackingCarrier: trackingCarrier.trim() || undefined },
      'Tracking saved. Customer emailed if it changed.'
    );
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    const ok = await post({ action: 'note', note: note.trim() }, 'Note saved.');
    if (ok) setNote('');
  };

  const grantCredit = async () => {
    const email = detail?.customerEmail;
    if (!email) {
      setError('This order has no customer email. Use "Generate code" instead.');
      return;
    }
    if (!confirm(`Give ${email} a ฿50 box-return credit and email it to them now?`)) return;
    setBusy(true);
    try {
      await adminApi({ method: 'POST', body: { action: 'grant-credit', email } });
      setMessage(`฿50 credit granted to ${email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant credit');
    } finally {
      setBusy(false);
    }
  };

  const grantCode = async () => {
    if (!confirm('Generate a one-time ฿50 box-return code to hand this customer?')) return;
    setBusy(true);
    try {
      const data = await adminApi<{ code: string }>({
        method: 'POST',
        body: { action: 'grant-code', email: detail?.customerEmail || undefined },
      });
      setMessage(`Code: ${data.code} (single use, ฿50).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setBusy(false);
    }
  };

  const refundable = detail?.paymentIntent
    ? (detail.paymentIntent.amountReceived || detail.paymentIntent.amount) - detail.refundedAmount
    : 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-warm-white overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-warm-white border-b border-soft-peach/60 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-deep-brown">
              Order #{detail?.orderNumber ?? sessionId.slice(-8).toUpperCase()}
            </h2>
            <p className="font-body text-earth text-[12px]">{detail?.customerEmail ?? ''}</p>
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
            {/* Summary */}
            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <Row label="Status" value={`${detail.status} · ${detail.paymentStatus}`} />
              <Row label="Mode" value={detail.mode} />
              <Row label="Total" value={baht(detail.amountTotal)} />
              {detail.refundedAmount > 0 && <Row label="Refunded" value={baht(detail.refundedAmount)} />}
              <Row label="Created" value={new Date(detail.createdAt).toLocaleString('en-GB')} />
              {detail.paymentIntent && <Row label="Payment intent" value={detail.paymentIntent.status} />}
              {detail.subscription && (
                <Row
                  label="Subscription"
                  value={`${detail.subscription.status}${detail.subscription.cancelAtPeriodEnd ? ' (cancels at period end)' : ''}`}
                />
              )}
              <Row label="Session" value={detail.sessionId} copy />
            </section>

            {/* Customer */}
            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <h3 className="font-display text-deep-brown">Customer</h3>
              <Row label="Name" value={detail.customerName ?? '—'} />
              <Row label="Email" value={detail.customerEmail ?? '—'} />
              <Row label="Phone" value={detail.customerPhone ?? '—'} />
              {detail.shippingAddress && (
                <Row label="Ship to" value={formatAddress(detail.shippingAddress)} />
              )}
            </section>

            {/* Items */}
            <section className="bg-cream rounded-2xl p-4">
              <h3 className="font-display text-deep-brown mb-2">Items</h3>
              {(detail.lineItems.length > 0 ? detail.lineItems : detail.items).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-soft-peach/40 last:border-0">
                  <span className="font-body text-[14px] text-deep-brown">
                    {item.quantity ?? 1}× {item.description ?? 'Item'}
                  </span>
                  <span className="font-body text-[13px] text-earth">{baht(item.amountTotal ?? 0)}</span>
                </div>
              ))}
            </section>

            {detail.isGift && (
              <section className="bg-cream rounded-2xl p-4 space-y-2">
                <h3 className="font-display text-deep-brown flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Gift
                </h3>
                <Row label="Recipient" value={`${detail.recipientName ?? '—'} · ${detail.recipientEmail ?? '—'}`} />
                {detail.giftMessage && <Row label="Message" value={detail.giftMessage} />}
              </section>
            )}

            {/* Tracking */}
            <section className="bg-cream rounded-2xl p-4">
              <h3 className="font-display text-deep-brown flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4" /> Tracking
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking number"
                  className="flex-1 bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
                />
                <input
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  placeholder="Carrier"
                  className="sm:w-36 bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
                />
                <button
                  onClick={saveTracking}
                  disabled={busy || !trackingNumber.trim()}
                  className="bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </section>

            {/* Box return */}
            <section className="bg-cream rounded-2xl p-4">
              <h3 className="font-display text-deep-brown mb-3">Box return</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={grantCredit}
                  disabled={busy}
                  className="text-accent-green font-body text-[13px] hover:underline disabled:opacity-60"
                >
                  Mark box returned (+฿50, emails customer)
                </button>
                <button
                  onClick={grantCode}
                  disabled={busy}
                  className="text-earth/70 font-body text-[12px] hover:underline disabled:opacity-60"
                >
                  No email? Generate code
                </button>
              </div>
            </section>

            {/* Note */}
            <section className="bg-cream rounded-2xl p-4">
              <h3 className="font-display text-deep-brown mb-3">Internal note</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Add a note (stored locally, never emailed)"
                className="w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
              />
              <button
                onClick={saveNote}
                disabled={busy || !note.trim()}
                className="mt-2 font-body text-sm text-deep-brown hover:text-rust underline disabled:opacity-60"
              >
                Save note
              </button>
            </section>

            {/* Money actions */}
            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <h3 className="font-display text-deep-brown">Payments</h3>
              {detail.refunds.length > 0 && (
                <div className="space-y-1">
                  {detail.refunds.map((r) => (
                    <div key={r.id} className="flex items-center justify-between font-body text-[12px] text-earth">
                      <span>{new Date(r.created * 1000).toLocaleDateString('en-GB')} · {r.reason ?? 'refund'}</span>
                      <span>{baht(r.amount)} · {r.status}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDialog('refund')}
                  disabled={busy || refundable <= 0}
                  className="flex items-center gap-2 bg-rust text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown disabled:opacity-50"
                >
                  <Undo2 className="w-4 h-4" /> Refund {refundable > 0 ? baht(refundable) : ''}
                </button>
                <button
                  onClick={() => setDialog('cancel')}
                  disabled={busy}
                  className="flex items-center gap-2 border border-rust text-rust font-body text-sm px-4 py-2 rounded-lg hover:bg-rust/10 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" /> Cancel order
                </button>
              </div>
              <p className="font-body text-earth/60 text-[11px]">
                Refund returns money to the customer. Cancel refunds a paid order in full, or cancels an
                uncaptured payment / subscription.
              </p>
            </section>

            {detail.invoice?.hostedInvoiceUrl && (
              <a
                href={detail.invoice.hostedInvoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-body text-sm text-deep-brown hover:text-rust"
              >
                <ExternalLink className="w-4 h-4" /> View invoice
              </a>
            )}
          </div>
        )}

        {dialog === 'refund' && (
        <ConfirmActionDialog
          title="Refund this order"
          description={
            <span>
              Refundable balance: <strong>{baht(refundable)}</strong>. This moves real money back to the
              customer and cannot be undone.
            </span>
          }
          confirmPhrase={detail?.orderNumber ?? ''}
          requireReason
          requireAmount
          amountLabel="Refund amount (THB)"
          defaultAmount={refundable > 0 ? String(refundable / 100) : ''}
          busy={busy}
          confirmLabel="Refund"
          onCancel={() => setDialog(null)}
          onConfirm={async ({ confirm, reason, amount }) => {
            const ok = await post(
              { action: 'refund', confirm, reason, amount: Math.round(Number(amount) * 100) },
              'Refund issued.'
            );
            if (ok) setDialog(null);
          }}
        />
        )}

        {dialog === 'cancel' && (
        <ConfirmActionDialog
          title="Cancel this order"
          description="A paid one-time order is refunded in full; an uncaptured payment or a subscription is cancelled outright."
          confirmPhrase={detail?.orderNumber ?? ''}
          requireReason
          busy={busy}
          confirmLabel="Cancel order"
          onCancel={() => setDialog(null)}
          onConfirm={async ({ confirm, reason }) => {
            const ok = await post({ action: 'cancel', confirm, reason }, 'Order cancelled.');
            if (ok) setDialog(null);
          }}
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

function formatAddress(address: Record<string, unknown>): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter((p) => typeof p === 'string' && p);
  return parts.join(', ') || '—';
}
