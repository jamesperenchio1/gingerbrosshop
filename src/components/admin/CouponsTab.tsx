import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Tag, Trash2, X } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import {
  adminApi,
  baht,
  type AdminCoupon,
  type AdminPromotionCode,
  type CouponListResponse,
  type PromotionCodeListResponse,
} from './api';
import ConfirmActionDialog from './ConfirmActionDialog';

function couponValue(coupon: AdminCoupon): string {
  if (coupon.percentOff != null) return `${coupon.percentOff}% off`;
  if (coupon.amountOff != null) return `${baht(coupon.amountOff)} off`;
  return '—';
}

function durationLabel(coupon: AdminCoupon): string {
  if (coupon.duration === 'once') return 'once';
  if (coupon.duration === 'forever') return 'forever';
  return `repeating · ${coupon.durationInMonths ?? '?'} mo`;
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi<CouponListResponse>({
        resource: 'coupons',
        action: 'list',
        query: { limit: 25, cursor: opts.reset ? undefined : opts.cursor ?? undefined },
      });
      setCoupons((prev) => (opts.reset ? res.coupons : [...prev, ...res.coupons]));
      setHasMore(res.hasMore);
      setCursor(res.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ reset: true });
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] font-body text-sm text-earth">
          <Tag className="w-4 h-4" /> {coupons.length} coupon{coupons.length === 1 ? '' : 's'}
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-rust text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-deep-brown transition-colors"
        >
          <Plus className="w-4 h-4" /> New coupon
        </button>
        <button
          onClick={() => load({ reset: true })}
          disabled={loading}
          className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {!loading && coupons.length === 0 && !error && (
        <div className="text-center py-16">
          <Tag className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No coupons yet.</p>
        </div>
      )}

      {coupons.length > 0 && (
        <div className="bg-cream rounded-2xl overflow-hidden">
          {coupons.map((coupon) => (
            <button
              key={coupon.id}
              onClick={() => setSelectedId(coupon.id)}
              className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-deep-brown truncate">
                    {coupon.name ?? coupon.id}
                  </span>
                  {!coupon.valid && (
                    <span className="text-[11px] font-body px-2 py-0.5 rounded-full bg-earth/15 text-earth">
                      Expired
                    </span>
                  )}
                </div>
                <div className="font-body text-[13px] text-earth/80 mt-0.5">
                  {couponValue(coupon)} · {durationLabel(coupon)} · {coupon.timesRedeemed} redeemed
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
        <CouponDetailPanel
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load({ reset: true })}
        />
      )}
      {creating && (
        <CreateCouponPanel
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

function CouponDetailPanel({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [coupon, setCoupon] = useState<AdminCoupon | null>(null);
  const [promoCodes, setPromoCodes] = useState<AdminPromotionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [creatingCode, setCreatingCode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ coupon: detail }, codes] = await Promise.all([
        adminApi<{ coupon: AdminCoupon }>({ resource: 'coupons', action: 'get', query: { id } }),
        adminApi<PromotionCodeListResponse>({
          resource: 'coupons',
          action: 'promotion-codes',
          query: { coupon: id, limit: 50 },
        }),
      ]);
      setCoupon(detail);
      setPromoCodes(codes.promotionCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupon');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleCode(code: AdminPromotionCode) {
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'coupons',
        method: 'POST',
        body: { action: 'update-promotion-code', id: code.id, active: !code.active },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
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
            {coupon?.name ?? 'Coupon'}
          </h2>
          <button onClick={onClose} className="p-2 text-earth hover:text-deep-brown">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
          </div>
        ) : !coupon ? (
          <p className="px-5 py-6 font-body text-[13px] text-rust">{error || 'Not found'}</p>
        ) : (
          <div className="px-5 py-5 space-y-5">
            {error && <p className="font-body text-[13px] text-rust">{error}</p>}
            {message && <p className="font-body text-[13px] text-accent-green">{message}</p>}

            <section className="bg-cream rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">Coupon</h3>
                <CopyButton value={coupon.id} />
              </div>
              <Row label="Discount" value={couponValue(coupon)} />
              <Row label="Duration" value={durationLabel(coupon)} />
              <Row label="Redeemed" value={`${coupon.timesRedeemed}${coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ''}`} />
              <Row label="Valid" value={coupon.valid ? 'Yes' : 'No'} />
              {coupon.redeemBy && (
                <Row label="Redeem by" value={new Date(coupon.redeemBy).toLocaleDateString()} />
              )}
              <Row label="Created" value={new Date(coupon.createdAt).toLocaleDateString()} />
            </section>

            <section className="bg-cream rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-deep-brown">Promotion codes</h3>
                <button
                  onClick={() => setCreatingCode(true)}
                  className="flex items-center gap-1 font-body text-[13px] text-rust hover:text-deep-brown"
                >
                  <Plus className="w-3.5 h-3.5" /> Add code
                </button>
              </div>
              {promoCodes.length === 0 && (
                <p className="font-body text-[13px] text-earth/70">No promotion codes.</p>
              )}
              <div className="space-y-2">
                {promoCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-soft-peach/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm text-deep-brown">{code.code}</span>
                        <CopyButton value={code.code} />
                      </div>
                      <div className="font-body text-[12px] text-earth/70">
                        {code.timesRedeemed}
                        {code.maxRedemptions ? ` / ${code.maxRedemptions}` : ''} redeemed
                        {code.expiresAt ? ` · expires ${new Date(code.expiresAt).toLocaleDateString()}` : ''}
                        {!code.active ? ' · inactive' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCode(code)}
                      disabled={busy}
                      className="font-body text-[12px] text-earth hover:text-deep-brown shrink-0 disabled:opacity-50"
                    >
                      {code.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-cream rounded-2xl p-4">
              <button
                onClick={() => setDeleteOpen(true)}
                disabled={busy}
                className="flex items-center gap-2 font-body text-sm text-rust hover:text-deep-brown disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete coupon
              </button>
            </section>
          </div>
        )}
      </div>

      {creatingCode && (
        <CreatePromotionCodePanel
          couponId={id}
          onClose={() => setCreatingCode(false)}
          onCreated={async () => {
            setCreatingCode(false);
            await load();
          }}
        />
      )}

      {deleteOpen && (
        <ConfirmActionDialog
          title="Delete coupon"
          description="This permanently deletes the coupon. Existing promotion codes for it will stop working."
          confirmPhrase={coupon?.name ?? coupon?.id ?? ''}
          requireReason
          busy={busy}
          confirmLabel="Delete"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={async ({ confirm, reason }) => {
            setBusy(true);
            setError('');
            try {
              await adminApi({
                resource: 'coupons',
                method: 'POST',
                body: { action: 'delete', id, confirm, reason },
              });
              setDeleteOpen(false);
              setMessage('Coupon deleted.');
              onChanged();
              onClose();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Delete failed');
              setDeleteOpen(false);
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
    </div>
  );
}

function CreateCouponPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'percent' | 'amount'>('percent');
  const [value, setValue] = useState('');
  const [duration, setDuration] = useState<'once' | 'repeating' | 'forever'>('once');
  const [durationInMonths, setDurationInMonths] = useState('3');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [redeemBy, setRedeemBy] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Enter a discount value greater than 0.');
      return;
    }
    if (mode === 'percent' && num > 100) {
      setError('Percent off cannot exceed 100.');
      return;
    }
    if (duration === 'repeating' && !(Number(durationInMonths) > 0)) {
      setError('Repeating coupons need a number of months.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'coupons',
        method: 'POST',
        body: {
          action: 'create',
          confirm: 'CREATE',
          name: name.trim() || undefined,
          percentOff: mode === 'percent' ? num : undefined,
          amountOff: mode === 'amount' ? Math.round(num * 100) : undefined,
          currency: mode === 'amount' ? 'thb' : undefined,
          duration,
          durationInMonths: duration === 'repeating' ? Number(durationInMonths) : undefined,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          redeemBy: redeemBy ? new Date(redeemBy).toISOString() : undefined,
        },
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create coupon');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-display text-lg text-deep-brown mb-4">New coupon</h3>
        {error && <p className="mb-3 font-body text-[13px] text-rust">{error}</p>}
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Name (optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Summer sale"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <div className="mb-3">
          <span className="font-body text-[13px] text-earth">Discount type</span>
          <div className="mt-1 flex gap-2">
            {(['percent', 'amount'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`font-body text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  mode === m
                    ? 'bg-rust text-cream border-rust'
                    : 'bg-white text-earth border-soft-peach hover:text-deep-brown'
                }`}
              >
                {m === 'percent' ? 'Percent off' : 'Amount off (฿)'}
              </button>
            ))}
          </div>
        </div>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">
            {mode === 'percent' ? 'Percent off' : 'Amount off (THB)'}
          </span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Duration</span>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value as typeof duration)}
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          >
            <option value="once">Once</option>
            <option value="repeating">Repeating</option>
            <option value="forever">Forever</option>
          </select>
        </label>
        {duration === 'repeating' && (
          <label className="block mb-3">
            <span className="font-body text-[13px] text-earth">Duration (months)</span>
            <input
              value={durationInMonths}
              onChange={(e) => setDurationInMonths(e.target.value)}
              inputMode="numeric"
              className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
            />
          </label>
        )}
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Max redemptions (optional)</span>
          <input
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            inputMode="numeric"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Redeem by (optional)</span>
          <input
            type="date"
            value={redeemBy}
            onChange={(e) => setRedeemBy(e.target.value)}
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
            onClick={submit}
            disabled={busy}
            className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreatePromotionCodePanel({
  couponId,
  onClose,
  onCreated,
}: {
  couponId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [code, setCode] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await adminApi({
        resource: 'coupons',
        method: 'POST',
        body: {
          action: 'create-promotion-code',
          couponId,
          code: code.trim() || undefined,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        },
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create code');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-display text-lg text-deep-brown mb-4">Add promotion code</h3>
        {error && <p className="mb-3 font-body text-[13px] text-rust">{error}</p>}
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Code (optional)</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Auto-generated if blank"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Max redemptions (optional)</span>
          <input
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            inputMode="numeric"
            className="mt-1 w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-sm focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
        </label>
        <label className="block mb-3">
          <span className="font-body text-[13px] text-earth">Expires (optional)</span>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
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
            onClick={submit}
            disabled={busy}
            className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create code'}
          </button>
        </div>
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
