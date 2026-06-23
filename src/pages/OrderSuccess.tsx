import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle, Package, Truck, Mail, FileText, Settings, Home, Gift } from 'lucide-react';
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
  amountSubtotal: number | null;
  amountShipping: number;
  amountDiscount: number;
  amountTotal: number;
  currency: string;
  status: string;
  isSubscription: boolean;
  invoiceUrl: string | null;
  invoicePdf: string | null;
  createdAt: string;
  items: OrderItem[];
  trackingNumber: string | null;
  trackingCarrier: string | null;
  isGift: boolean;
  recipientEmail: string | null;
  recipientName: string | null;
  giftMessage: string | null;
}

const baht = (minor: number | null | undefined) => `฿${((minor ?? 0) / 100).toLocaleString()}`;

/** Confirmed → Preparing → Shipped progress, based on whether tracking exists. */
function OrderTimeline({ shipped }: { shipped: boolean }) {
  const steps = [
    { label: 'Confirmed', icon: CheckCircle, done: true },
    { label: 'Preparing', icon: Package, done: true },
    { label: 'Shipped', icon: Truck, done: shipped },
    { label: 'Delivered', icon: Home, done: false },
  ];
  // The first not-yet-done step is the "current" one.
  const currentIdx = steps.findIndex((s) => !s.done);
  return (
    <div className="overflow-x-auto -mx-2 px-2 mb-6">
      <div className="flex items-start justify-between min-w-[280px]">
        {steps.map((step, i) => {
          const active = step.done || i === currentIdx;
          return (
            <div key={step.label} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <span
                  className={`absolute top-4 right-1/2 w-full h-0.5 ${
                    step.done ? 'bg-accent-green' : 'bg-soft-peach'
                  }`}
                />
              )}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.done
                    ? 'bg-accent-green text-white'
                    : i === currentIdx
                    ? 'bg-amber text-deep-brown'
                    : 'bg-soft-peach/60 text-earth/50'
                }`}
              >
                <step.icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 font-body text-[11px] sm:text-[12px] text-center ${
                  active ? 'text-deep-brown font-medium' : 'text-earth/50'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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
  const receiptUrl = order.invoicePdf ?? order.invoiceUrl;
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

  const hasBreakdown = order.amountSubtotal != null;

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Thank You for Your Order — GingerBros"
        description="Your GingerBros order has been confirmed. Check your email for the receipt and tracking updates."
        path="/order/success"
        noindex
      />
      <div className="max-w-lg mx-auto px-6 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="font-display text-3xl text-deep-brown mb-2">Thank You{order.customerName ? `, ${order.customerName.split(' ')[0]}` : ''}!</h1>
          <p className="font-body text-earth">
            Your order is confirmed{order.customerEmail ? <> — a receipt is on its way to <span className="text-deep-brown font-medium">{order.customerEmail}</span></> : ''}.
          </p>
        </div>

        {/* Split-checkout: subscription leg still to run */}
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
            {continueError && <p className="mt-3 font-body text-[13px] text-amber">{continueError}</p>}
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white border border-soft-peach rounded-2xl p-6 sm:p-8 mb-6 shadow-[0_8px_30px_rgba(61,36,16,0.06)]">
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-soft-peach/60">
            <div>
              <p className="font-body text-[12px] text-earth uppercase tracking-wider">Order #</p>
              <p className="font-display font-semibold text-deep-brown text-lg">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-body text-[12px] text-earth uppercase tracking-wider">Total</p>
              <p className="font-display font-semibold text-deep-brown text-lg">{baht(order.amountTotal)}{order.isSubscription ? '' : ''}</p>
            </div>
          </div>

          {/* Status timeline */}
          <OrderTimeline shipped={!!order.trackingNumber} />

          {/* Items */}
          <div className="space-y-4 mb-5 pt-5 border-t border-soft-peach/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-earth flex-shrink-0" />
                  <div>
                    <p className="font-body font-medium text-deep-brown text-[15px]">{item.description}</p>
                    <p className="font-body text-[13px] text-earth">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-body font-medium text-deep-brown">{baht(item.amountTotal)}</p>
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          {hasBreakdown && (
            <div className="pt-4 border-t border-soft-peach/60 space-y-1.5 font-body text-[14px]">
              <div className="flex justify-between text-earth">
                <span>Subtotal</span>
                <span>{baht(order.amountSubtotal)}</span>
              </div>
              {order.amountDiscount > 0 && (
                <div className="flex justify-between text-accent-green">
                  <span>Discount</span>
                  <span>−{baht(order.amountDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-earth">
                <span>Shipping</span>
                <span>{order.amountShipping > 0 ? baht(order.amountShipping) : 'Free'}</span>
              </div>
              <div className="flex justify-between text-deep-brown font-semibold text-[15px] pt-1.5">
                <span>Total</span>
                <span>{baht(order.amountTotal)}</span>
              </div>
            </div>
          )}

          {/* Gift */}
          {order.isGift && (
            <div className="pt-4 mt-4 border-t border-soft-peach/60">
              <p className="font-body text-[12px] text-earth uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" /> Gift Recipient
              </p>
              <p className="font-body text-deep-brown">{order.recipientName ?? 'Not provided'}</p>
              <p className="font-body text-earth text-[14px]">{order.recipientEmail ?? 'No email provided'}</p>
              {order.giftMessage && <p className="font-body text-earth text-[14px] mt-2 italic">“{order.giftMessage}”</p>}
            </div>
          )}

          {/* Shipping address */}
          {address && (
            <div className="pt-4 mt-4 border-t border-soft-peach/60">
              <p className="font-body text-[12px] text-earth uppercase tracking-wider mb-2">Shipping to</p>
              <p className="font-body text-deep-brown">{order.shippingName}</p>
              <p className="font-body text-earth text-[14px]">{address}</p>
              {order.customerPhone && <p className="font-body text-earth text-[14px] mt-1">{order.customerPhone}</p>}
            </div>
          )}
        </div>

        {/* Tracking / next steps */}
        {order.trackingNumber ? (
          <div className="bg-deep-brown text-cream rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5" />
              <h3 className="font-display font-semibold">Your Order Has Shipped</h3>
            </div>
            <p className="font-body text-cream/80 mb-1">
              {order.trackingCarrier ?? 'Carrier'}: <span className="font-semibold text-cream">{order.trackingNumber}</span>
            </p>
            <p className="font-body text-cream/60 text-[13px] mb-4">Keep it refrigerated as soon as it arrives 🧊</p>
            <a
              href="https://gingerbrosshop.com/track"
              className="inline-block bg-cream text-deep-brown font-body font-medium px-6 py-2.5 rounded-full hover:bg-amber transition-colors text-sm"
            >
              Track Order
            </a>
          </div>
        ) : (
          <div className="bg-white border border-soft-peach rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-earth" />
              <h3 className="font-display font-semibold text-deep-brown">What's Next?</h3>
            </div>
            <p className="font-body text-earth">
              We're preparing your order with care. You'll get an email with tracking details the moment it ships — and remember, it's a living brew, so pop it in the fridge on arrival.
            </p>
          </div>
        )}

        {/* Self-service: receipt + portal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white border border-soft-peach rounded-full py-3 font-body font-medium text-[14px] text-deep-brown hover:border-amber transition-colors"
            >
              <FileText className="w-4 h-4" /> Download Receipt
            </a>
          )}
          {order.customerEmail && (
            <a
              href={`/api/portal?email=${encodeURIComponent(order.customerEmail)}`}
              className={`flex items-center justify-center gap-2 bg-white border border-soft-peach rounded-full py-3 font-body font-medium text-[14px] text-deep-brown hover:border-amber transition-colors ${
                receiptUrl ? '' : 'sm:col-span-2'
              }`}
            >
              <Settings className="w-4 h-4" />
              {order.isSubscription ? 'Manage Subscription' : 'Manage Order & Receipts'}
            </a>
          )}
        </div>

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
