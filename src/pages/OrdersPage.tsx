import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Search, Package, Truck, CheckCircle, ChevronDown, ChevronUp, Mail, RotateCcw, Clock } from 'lucide-react';
import SEO from '@/components/SEO';
import CopyButton from '@/components/CopyButton';

interface OrderSummary {
  sessionId: string;
  orderId: string;
  amountTotal: number;
  currency: string;
  status: string;
  createdAt: string;
  items: Array<{ description: string; quantity: number; amountTotal: number }>;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  isGift?: boolean;
  mode?: string;
}

function OrderCard({ order }: { order: OrderSummary }) {
  const [open, setOpen] = useState(false);
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const hasTracking = !!order.trackingNumber;

  return (
    <div className="bg-cream rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-soft-peach/30 transition-colors"
      >
        <div className="flex items-start gap-3 text-left">
          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${hasTracking ? 'bg-accent-green/15' : 'bg-amber/15'}`}>
            {hasTracking ? (
              <Truck className="w-4 h-4 text-accent-green" />
            ) : (
              <CheckCircle className="w-4 h-4 text-amber" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-semibold text-deep-brown">#{order.orderId}</span>
              <CopyButton value={order.orderId} />
              {order.isGift && <span className="text-[11px] font-medium text-earth bg-soft-peach/70 px-2 py-0.5 rounded-full">Gift</span>}
              {order.mode === 'subscription' && <span className="text-[11px] font-medium text-rust bg-rust/10 px-2 py-0.5 rounded-full">Subscription</span>}
            </div>
            <p className="font-body text-[13px] text-earth mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-display font-semibold text-deep-brown">฿{(order.amountTotal / 100).toLocaleString()}</span>
          {open ? <ChevronUp className="w-4 h-4 text-earth" /> : <ChevronDown className="w-4 h-4 text-earth" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-soft-peach/50">
          <div className="space-y-2 pt-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between font-body text-[14px]">
                <span className="text-earth">{item.description} × {item.quantity}</span>
                <span className="text-deep-brown">฿{(item.amountTotal / 100).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-soft-peach/50 space-y-3">
            {hasTracking ? (
              <div className="flex items-center gap-2 font-body text-[14px]">
                <Truck className="w-4 h-4 text-accent-green flex-shrink-0" />
                <span className="text-deep-brown">
                  {order.trackingCarrier ? `${order.trackingCarrier}: ` : ''}{order.trackingNumber}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-earth flex-shrink-0 mt-0.5" />
                <p className="font-body text-[13px] text-earth">Preparing for shipment — tracking will appear here once shipped.</p>
              </div>
            )}

            <Link
              to={`/track?email=&order=${order.orderId}`}
              className="inline-flex items-center gap-1.5 font-body text-[13px] text-rust hover:text-deep-brown underline"
            >
              <Search className="w-3.5 h-3.5" />
              Track this order →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setOrders(null);
    try {
      const res = await fetch(`/api/orders-by-email?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Lookup failed');
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="My Orders — GingerBros"
        description="Look up your past GingerBros orders by email address."
        path="/orders"
        noindex
      />
      <div className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-xl border-b border-soft-peach/50">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-body font-medium text-sm text-earth hover:text-deep-brown transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>
          <span className="font-display font-bold text-lg text-deep-brown">GingerBros</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <Package className="w-10 h-10 text-deep-brown mx-auto mb-4" />
          <h1 className="font-display font-bold text-deep-brown text-2xl md:text-3xl mb-2">My Orders</h1>
          <p className="font-body text-earth">Enter your email to see all past orders.</p>
        </div>

        <form onSubmit={handleLookup} className="flex gap-2 mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="flex-1 bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-deep-brown text-cream font-body font-medium rounded-full hover:bg-rust transition-colors disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Find
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center mb-6">
            <p className="font-body text-rust text-sm">{error}</p>
          </div>
        )}

        {orders !== null && (
          orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-earth/30 mx-auto mb-3" />
              <p className="font-body text-earth">No orders found for this email.</p>
              <p className="font-body text-earth/60 text-sm mt-1">
                If you checked out as a guest, make sure to use the same email.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-body text-[13px] text-earth mb-4">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
              {orders.map((order) => (
                <OrderCard key={order.sessionId} order={order} />
              ))}
            </div>
          )
        )}

        {/* Help section */}
        <div className="mt-12 bg-cream rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-deep-brown text-[1.1rem]">Need help with an order?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-rust flex-shrink-0 mt-0.5" />
              <p className="font-body text-earth text-[14px]">
                Email us at{' '}
                <a href="mailto:gingerbros.brew@gmail.com" className="text-rust font-semibold underline">
                  gingerbros.brew@gmail.com
                </a>{' '}
                with your order number and we will sort it out.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-rust flex-shrink-0 mt-0.5" />
              <p className="font-body text-earth text-[14px]">
                <Link to="/track" className="text-rust font-semibold underline">Track an order</Link>{' '}
                by email and order number to see the latest status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
