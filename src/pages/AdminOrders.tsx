import { useState, useEffect } from 'react';
import { Package, Truck, Search, Eye, EyeOff } from 'lucide-react';

interface Order {
  sessionId: string;
  paymentIntentId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: Record<string, string> | null;
  items: Array<{ id: string; description: string; quantity: number; amountTotal: number }>;
  amountTotal: number;
  currency: string;
  status: string;
  createdAt: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
}

const TOKEN_KEY = 'gingerbros-admin-token';

export default function AdminOrders() {
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY);
      if (stored) setToken(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadOrders = () => {
    setLoading(true);
    setError('');
    fetch('/api/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Failed to load orders');
        }
        return res.json();
      })
      .then((data: { orders: Order[] }) => {
        setOrders(data.orders);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setLoading(false);
      });
  };

  const saveTracking = async (sessionId: string) => {
    if (!trackingInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          trackingNumber: trackingInput.trim(),
          trackingCarrier: carrierInput.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to save');
      }
      setSelectedOrder(null);
      setTrackingInput('');
      setCarrierInput('');
      loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save tracking');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setOrders([]);
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  };

  if (!token || (orders.length === 0 && error)) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <Package className="w-10 h-10 text-deep-brown mx-auto mb-3" />
            <h1 className="font-display text-2xl text-deep-brown">Admin</h1>
            <p className="font-body text-earth text-sm">Enter your admin secret to view orders.</p>
          </div>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setToken(e.currentTarget.value);
                }
              }}
              placeholder="Admin secret"
              className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-3 pr-12 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-earth hover:text-deep-brown"
              type="button"
            >
              {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="mt-3 font-body text-[13px] text-rust text-center">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl text-deep-brown">Orders</h1>
            <p className="font-body text-earth text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-full hover:bg-rust transition-colors"
            >
              <Search className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="font-body text-sm text-earth hover:text-deep-brown px-3 py-2"
            >
              Log out
            </button>
          </div>
        </div>

        {loading && orders.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
            const orderNum = order.sessionId.slice(-8).toUpperCase();
            const total = (order.amountTotal / 100).toLocaleString();
            const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const isOpen = selectedOrder?.sessionId === order.sessionId;

            return (
              <div key={order.sessionId} className="bg-cream rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display font-semibold text-deep-brown">#{orderNum}</span>
                      <span className="inline-block font-body text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Paid
                      </span>
                    </div>
                    <p className="font-body text-earth text-[13px]">
                      {order.customerName ?? 'Guest'} · {order.customerEmail ?? 'No email'}
                    </p>
                    <p className="font-body text-earth/60 text-[12px] mt-0.5">{date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold text-deep-brown">฿{total}</p>
                    <p className="font-body text-earth text-[12px]">{order.items.reduce((a, i) => a + i.quantity, 0)} items</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-soft-peach/50">
                  {order.trackingNumber ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <Truck className="w-4 h-4" />
                      <span className="font-body text-[14px]">
                        {order.trackingCarrier ?? 'Tracking'}: <strong>{order.trackingNumber}</strong>
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOrder(isOpen ? null : order);
                        setTrackingInput('');
                        setCarrierInput('');
                      }}
                      className="text-rust font-body text-[14px] hover:underline"
                    >
                      {isOpen ? 'Cancel' : '+ Add tracking number'}
                    </button>
                  )}

                  {isOpen && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="Tracking number"
                        className="flex-1 bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-[14px] focus:outline-none focus:ring-2 focus:ring-rust/30"
                      />
                      <input
                        type="text"
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        placeholder="Carrier (e.g. Kerry, Flash)"
                        className="sm:w-40 bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown text-[14px] focus:outline-none focus:ring-2 focus:ring-rust/30"
                      />
                      <button
                        onClick={() => saveTracking(order.sessionId)}
                        disabled={saving || !trackingInput.trim()}
                        className="bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors disabled:opacity-60"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-earth/30 mx-auto mb-3" />
            <p className="font-body text-earth">No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
