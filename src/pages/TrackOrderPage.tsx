import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Package, Truck, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

interface OrderResult {
  sessionId: string;
  customerName: string | null;
  customerEmail: string | null;
  amountTotal: number;
  currency: string;
  status: string;
  createdAt: string;
  items: Array<{ description: string; quantity: number; amountTotal: number }>;
  trackingNumber: string | null;
  trackingCarrier: string | null;
}

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [orderNum, setOrderNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !orderNum.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/track-order?email=${encodeURIComponent(email)}&order=${encodeURIComponent(orderNum)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Order not found');
      setResult(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Track Your Order — GingerBros"
        description="Track your GingerBros craft ginger fizz order status. Enter your email and order number to see shipping updates."
        path="/track"
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
          <h1 className="font-display font-bold text-deep-brown text-2xl md:text-3xl mb-2">Track Your Order</h1>
          <p className="font-body text-earth">Enter your email and order number to check status.</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-4 mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
          <input
            type="text"
            value={orderNum}
            onChange={(e) => setOrderNum(e.target.value)}
            placeholder="Order number (e.g. A1B2C3D4)"
            required
            className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deep-brown text-cream font-body font-medium py-3.5 rounded-full hover:bg-rust transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                Track Order
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <p className="font-body text-rust text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-cream rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-soft-peach/50">
              <div>
                <p className="font-body text-[13px] text-earth uppercase tracking-wider">Order</p>
                <p className="font-display font-semibold text-deep-brown">#{orderNum.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-body text-[13px] text-earth uppercase tracking-wider">Total</p>
                <p className="font-display font-semibold text-deep-brown">
                  ฿{(result.amountTotal / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {result.items.map((item, idx) => (
                <div key={idx} className="flex justify-between font-body text-[14px]">
                  <span className="text-earth">{item.description} × {item.quantity}</span>
                  <span className="text-deep-brown">฿{(item.amountTotal / 100).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-soft-peach/50">
              {result.trackingNumber ? (
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-accent-green" />
                  <div>
                    <p className="font-body text-deep-brown font-medium">
                      {result.trackingCarrier ?? 'Carrier'}: {result.trackingNumber}
                    </p>
                    <p className="font-body text-earth text-[13px]">Your order is on the way!</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber" />
                  <div>
                    <p className="font-body text-deep-brown font-medium">Order Confirmed</p>
                    <p className="font-body text-earth text-[13px]">We are preparing your order for shipment.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
