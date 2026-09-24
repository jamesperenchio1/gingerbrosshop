import { useCallback, useEffect, useState } from 'react';
import { Package, RefreshCw, Search } from 'lucide-react';
import { adminApi, baht, type MergedOrder, type OrderListResponse } from './api';
import OrderDetailPanel from './OrderDetailPanel';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'complete', label: 'Complete' },
  { value: 'open', label: 'Open' },
  { value: 'expired', label: 'Expired' },
];

export default function OrdersTab() {
  const [orders, setOrders] = useState<MergedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(
    async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi<OrderListResponse>({
          resource: 'orders',
          action: 'list',
          query: {
            limit: 25,
            email: emailFilter.trim() || undefined,
            status: statusFilter || undefined,
            cursor: opts.reset ? undefined : opts.cursor ?? undefined,
          },
        });
        setOrders((prev) => (opts.reset ? data.orders : [...prev, ...data.orders]));
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
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
        <div className="relative flex-1 min-w-[220px]">
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
      </form>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {loading && orders.length === 0 && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
        </div>
      )}

      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-earth/30 mx-auto mb-3" />
          <p className="font-body text-earth">No orders found.</p>
        </div>
      )}

      <div className="bg-cream rounded-2xl overflow-hidden">
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return (
            <button
              key={order.sessionId}
              onClick={() => setSelectedId(order.sessionId)}
              className="w-full text-left px-5 py-4 border-b border-soft-peach/50 last:border-0 hover:bg-warm-white/60 transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-deep-brown">#{order.orderNumber}</span>
                  {order.mode === 'subscription' && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust/10 text-rust">
                      Sub
                    </span>
                  )}
                  {order.trackingNumber && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green">
                      Shipped
                    </span>
                  )}
                  {order.isGift && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust/10 text-rust">
                      Gift
                    </span>
                  )}
                </div>
                <p className="font-body text-earth text-[13px] truncate">
                  {order.customerName ?? 'Guest'} · {order.customerEmail ?? 'No email'}
                </p>
                <p className="font-body text-earth/60 text-[12px] mt-0.5">
                  {date} · {order.paymentStatus}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-semibold text-deep-brown">{baht(order.amountTotal)}</p>
                <p className="font-body text-earth text-[12px]">{order.itemCount} items</p>
              </div>
            </button>
          );
        })}
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
        <OrderDetailPanel
          sessionId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load({ reset: true })}
        />
      )}
    </div>
  );
}
