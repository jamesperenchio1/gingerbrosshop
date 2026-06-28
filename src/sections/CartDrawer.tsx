import { useRef, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router';
import { CloseIcon, TrashIcon, LockIcon, ShoppingBagIcon, PlusIcon, MinusIcon } from '@/components/Icons';
import { PENDING_SUBSCRIPTION_CHECKOUT_KEY, startCheckout } from '@/lib/checkout';

export default function CartDrawer() {
  const { state, closeCart, removeItem, updateQuantity, decrementOrRemove, subtotal } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(state.isOpen);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [prefetchedUrl, setPrefetchedUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mount immediately when opening (state adjustment during render, per React
  // docs); the effect below only delays the unmount so the slide-out
  // transition can finish.
  if (state.isOpen && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (!state.isOpen) {
      const id = window.setTimeout(() => setMounted(false), 300);
      return () => window.clearTimeout(id);
    }
  }, [state.isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    const handlePageShow = () => {
      // Reset body overflow when page is restored from bfcache
      if (!state.isOpen) {
        document.body.style.overflow = '';
      }
    };
    if (state.isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('pageshow', handlePageShow);
      document.body.style.overflow = '';
    };
  }, [state.isOpen, closeCart]);

  const hasMixedCart = state.items.some(i => i.isSubscription) && state.items.some(i => !i.isSubscription);
  const hasGingerFizz = state.items.some(i => i.productId === 'ginger-fizz');

  // Pre-create the Stripe checkout session in the background as soon as the cart
  // opens, so clicking "Checkout" redirects instantly instead of waiting for the API.
  const cartKey = state.items.map(i => `${i.id}:${i.quantity}`).join('|');
  useEffect(() => {
    const isMixed = state.items.some(i => i.isSubscription) && state.items.some(i => !i.isSubscription);
    if (!state.isOpen || state.items.length === 0 || isMixed) {
      setPrefetchedUrl(null);
      return;
    }
    setPrefetchedUrl(null);
    let cancelled = false;
    startCheckout(state.items).then(url => {
      if (!cancelled) setPrefetchedUrl(url);
    }).catch(() => { /* retry on click */ });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isOpen, cartKey]);

  const handleCheckout = async () => {
    if (state.items.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      if (hasMixedCart) {
        // A Stripe Checkout Session can only be in one mode (payment or subscription),
        // so a mixed cart pays for its one-time items first; the success page picks up
        // the subscription leg automatically once that session completes.
        const oneTimeItems = state.items.filter((i) => !i.isSubscription);
        sessionStorage.setItem(PENDING_SUBSCRIPTION_CHECKOUT_KEY, '1');
        window.location.href = await startCheckout(oneTimeItems);
        return;
      }
      window.location.href = prefetchedUrl ?? await startCheckout(state.items);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleViewProduct = (item: { productId?: string; id: string }) => {
    // Prefer the catalog product id; fall back to stripping a legacy "-sub-"
    // suffix from older cart items persisted before the Stripe-driven catalog.
    const subIndex = item.id.indexOf('-sub-');
    const productId = item.productId ?? (subIndex > 0 ? item.id.slice(0, subIndex) : item.id);
    navigate(`/product/${productId}`);
  };

  if (!mounted) return null;

  return (
    <>
      <div
        data-testid="cart-overlay"
        className={`fixed inset-0 bg-black/20 z-[60] transition-opacity duration-300 ${
          state.isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ opacity: state.isOpen ? 1 : 0 }}
        onClick={closeCart}
      />

      <div
        ref={drawerRef}
        data-testid="cart-drawer"
        aria-hidden={!state.isOpen}
        inert={!state.isOpen || undefined}
        className={`fixed top-0 right-0 h-full w-full sm:w-[min(92vw,400px)] bg-warm-white z-[70] shadow-[-8px_0_40px_rgba(61,36,16,0.1)] flex flex-col transition-transform duration-300 ${
          state.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-soft-peach/50">
          <h2 className="font-display font-semibold text-deep-brown text-[1.1rem]">
            Your Cart
          </h2>
          <button onClick={closeCart} aria-label="Close cart" data-testid="cart-close" className="text-deep-brown hover:text-rust transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBagIcon className="text-soft-peach mb-4" />
              <p className="font-body text-earth mb-2">Your cart is empty</p>
              <button onClick={closeCart} className="font-body font-medium text-rust hover:underline">
                Start shopping
              </button>
            </div>
          ) : (
            <div data-testid="cart-items" className="space-y-3">
              {state.items.map((item) => (
                <div key={item.id} data-testid={`cart-item-${item.id}`} className="flex gap-3 pb-3 border-b border-soft-peach last:border-0">
                  <button
                    onClick={() => handleViewProduct(item)}
                    className="w-14 h-14 rounded-xl overflow-hidden bg-cream flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button onClick={() => handleViewProduct(item)}>
                          <h4 className="font-body font-medium text-deep-brown text-[15px] leading-tight text-left hover:text-rust transition-colors">
                            {item.name}
                          </h4>
                        </button>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-block font-body font-semibold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          {item.isSubscription && (
                            <span className="inline-block font-body font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-deep-brown text-cream">
                              {item.interval}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-earth hover:text-rust transition-colors flex-shrink-0"
                        title="Remove item"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-soft-peach rounded-full px-2 py-1">
                        <button
                          onClick={() => decrementOrRemove(item.id)}
                          className="text-earth hover:text-deep-brown transition-colors"
                          title="Decrease quantity"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="font-body font-medium text-earth text-[13px] min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-earth hover:text-deep-brown transition-colors"
                          title="Increase quantity"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-body font-medium text-[13px] text-rust">
                        ฿{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t border-soft-peach/50 px-5 py-4 space-y-3">
            {/* Totals */}
            <div className="flex items-center justify-between">
              <span className="font-body text-earth text-[15px]">Subtotal</span>
              <span className="font-display font-semibold text-deep-brown text-lg">฿{subtotal}</span>
            </div>

            {/* Fine print — kept to a few quiet lines */}
            <div className="font-body text-[12px] text-earth/60 leading-relaxed">
              <p>{hasGingerFizz ? '+฿100 chilled delivery.' : subtotal >= 500 ? 'Free shipping included.' : '+฿100 shipping · free over ฿500'}</p>
              {state.items.some((i) => i.isSubscription) && (
                <p>Subscription billed {state.items.find((i) => i.isSubscription)?.interval}.</p>
              )}
              {hasMixedCart && <p>One-time &amp; subscription items check out in two quick steps.</p>}
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              data-testid="cart-checkout"
              className="w-full bg-deep-brown text-cream font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full hover:bg-rust active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-90"
            >
              {isCheckingOut ? (
                <>
                  <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  <span>Redirecting…</span>
                </>
              ) : (
                <>
                  <LockIcon />
                  Checkout
                </>
              )}
            </button>

            {checkoutError && (
              <p className="font-body text-[13px] text-center text-rust">{checkoutError}</p>
            )}

            <button
              onClick={closeCart}
              data-testid="cart-continue"
              className="w-full text-center font-body font-medium text-[13px] text-earth/60 hover:text-rust transition-colors"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
