import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PENDING_SUBSCRIPTION_CHECKOUT_KEY, startCheckout } from '@/lib/checkout';
import type { CartItem } from '@/types/cart';
import SEO from '@/components/SEO';

interface OrderItem {
  description: string;
  quantity: number;
  amountTotal: number;
  unitAmount: number;
}

interface OrderDetails {
  sessionId: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: Record<string, string> | null;
  shippingName: string | null;
  amountTotal: number;
  currency: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  trackingNumber: string | null;
  trackingCarrier: string | null;
  isGift: boolean;
  recipientEmail: string | null;
  recipientName: string | null;
  giftMessage: string | null;
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingSubscriptionItems, setPendingSubscriptionItems] = useState<CartItem[]>([]);
  const [continuingCheckout, setContinuingCheckout] = useState(false);
  const [continueError, setContinueError] = useState('');
  const { state, clearCart, removeItem } = useCart();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // A mixed cart pays in two Stripe sessions: one-time items first, then the
    // subscription. This flag is set right before redirecting to the first session,
    // so landing back here with it set means the subscription leg still needs to run.
    const isSplitCheckout = sessionStorage.getItem(PENDING_SUBSCRIPTION_CHECKOUT_KEY) === '1';
    sessionStorage.removeItem(PENDING_SUBSCRIPTION_CHECKOUT_KEY);

    if (isSplitCheckout) {
      const remaining = state.items.filter((i) => i.isSubscription);
      state.items.filter((i) => !i.isSubscription).forEach((i) => removeItem(i.id));
      setPendingSubscriptionItems(remaining);
    } else {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueSubscriptionCheckout = async () => {
    setContinuingCheckout(true);
    setContinueError('');
    try {
      window.location.href = await startCheckout(pendingSubscriptionItems);
    } catch (err) {
      setContinueError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setContinuingCheckout(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setError('No order session found.');
      setLoading(false);
      return;
    }

    fetch(`/api/order-details?session_id=${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Failed to load order');
        }
        return res.json();
      })
      .then((data: OrderDetails) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl text-deep-brown mb-3">Order Not Found</h1>
          <p className="font-body text-earth mb-6">{error || "We couldn't find your order details."}</p>
          <Link to="/" className="inline-block bg-deep-brown text-cream font-body font-medium px-8 py-3 rounded-full hover:bg-rust transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order.sessionId.slice(-8).toUpperCase();
  const total = (order.amountTotal / 100).toLocaleString();
  const address = order.shippingAddress
    ? [
        order.shippingAddress.line1,
        order.shippingAddress.line2,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.postal_code,
        order.shippingAddress.country,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Thank You for Your Order — GingerBros"
        description="Your GingerBros order has been confirmed. Check your email for the receipt and tracking updates."
        path="/order/success"
        noindex
      />
      <div className="max-w-lg mx-auto px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="font-display text-3xl text-deep-brown mb-2">Thank You!</h1>
          <p className="font-body text-earth">Your order has been confirmed.</p>
        </div>

        {pendingSubscriptionItems.length > 0 && (
          <div className="bg-deep-brown text-cream rounded-2xl p-6 sm:p-8 mb-6">
            <h3 className="font-display font-semibold mb-2">One Step Left</h3>
            <p className="font-body text-cream/80 mb-4">
              This order covered your one-time items. Continue to set up the subscription items still in your cart.
            </p>
            <button
              onClick={handleContinueSubscriptionCheckout}
              disabled={continuingCheckout}
              className="bg-cream text-deep-brown font-body font-medium px-6 py-2.5 rounded-full hover:bg-amber transition-colors text-sm disabled:opacity-80"
            >
              {continuingCheckout ? 'Redirecting to Stripe…' : 'Continue to Subscription Checkout'}
            </button>
            {continueError && (
              <p className="mt-3 font-body text-[13px] text-amber">{continueError}</p>
            )}
          </div>
        )}

        <div className="bg-cream rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-soft-peach/50">
            <div>
              <p className="font-body text-[13px] text-earth uppercase tracking-wider">Order #</p>
              <p className="font-display font-semibold text-deep-brown">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-body text-[13px] text-earth uppercase tracking-wider">Total</p>
              <p className="font-display font-semibold text-deep-brown">฿{total}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-earth flex-shrink-0" />
                  <div>
                    <p className="font-body font-medium text-deep-brown text-[15px]">{item.description}</p>
                    <p className="font-body text-[13px] text-earth">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-body font-medium text-deep-brown">฿{(item.amountTotal / 100).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {order.isGift && (
            <div className="pt-4 border-t border-soft-peach/50">
              <p className="font-body text-[13px] text-earth uppercase tracking-wider mb-2">Gift Recipient</p>
              <p className="font-body text-deep-brown">{order.recipientName ?? 'Not provided'}</p>
              <p className="font-body text-earth text-[14px]">{order.recipientEmail ?? 'No email provided'}</p>
              {order.giftMessage && (
                <p className="font-body text-earth text-[14px] mt-2 italic">“{order.giftMessage}”</p>
              )}
            </div>
          )}

          {address && (
            <div className={`pt-4 border-t border-soft-peach/50 ${order.isGift ? 'mt-4' : ''}`}>
              <p className="font-body text-[13px] text-earth uppercase tracking-wider mb-2">Shipping to</p>
              <p className="font-body text-deep-brown">{order.shippingName}</p>
              <p className="font-body text-earth text-[14px]">{address}</p>
              {order.customerPhone && <p className="font-body text-earth text-[14px] mt-1">{order.customerPhone}</p>}
            </div>
          )}
        </div>

        {order.trackingNumber ? (
          <div className="bg-deep-brown text-cream rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5" />
              <h3 className="font-display font-semibold">Your Order Has Shipped</h3>
            </div>
            <p className="font-body text-cream/80 mb-1">
              {order.trackingCarrier ?? 'Carrier'}: <span className="font-semibold text-cream">{order.trackingNumber}</span>
            </p>
            <p className="font-body text-cream/60 text-[13px]">You'll receive updates at {order.customerEmail}</p>
          </div>
        ) : (
          <div className="bg-white border border-soft-peach rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-earth" />
              <h3 className="font-display font-semibold text-deep-brown">What's Next?</h3>
            </div>
            <p className="font-body text-earth">
              We're preparing your order. You'll receive an email with tracking details once it ships.
            </p>
          </div>
        )}

        {order.items.some((i) => i.description?.includes('Subscription') || i.description?.includes('Monthly') || i.description?.includes('weekly') || i.description?.includes('every 2 weeks')) && (
          <div className="bg-cream rounded-2xl p-6 sm:p-8 mb-6">
            <h3 className="font-display font-semibold text-deep-brown mb-2">Manage Your Subscription</h3>
            <p className="font-body text-earth text-[14px] mb-4">
              You can pause, skip, or cancel your subscription anytime.
            </p>
            <a
              href={`/api/portal?email=${encodeURIComponent(order.customerEmail ?? '')}`}
              className="inline-block bg-deep-brown text-cream font-body font-medium px-6 py-2.5 rounded-full hover:bg-rust transition-colors text-sm"
            >
              Open Subscription Portal
            </a>
          </div>
        )}

        <div className="text-center">
          <Link
            to="/"
            className="inline-block bg-deep-brown text-cream font-body font-medium px-10 py-3.5 rounded-full hover:bg-rust transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
