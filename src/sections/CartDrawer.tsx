import { useRef, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CloseIcon, TrashIcon, LockIcon, ShoppingBagIcon, PlusIcon, MinusIcon } from '@/components/Icons';
import { PENDING_SUBSCRIPTION_CHECKOUT_KEY, REFERRAL_CODE_STORAGE_KEY, startCheckout } from '@/lib/checkout';
import { FREE_SHIPPING_THRESHOLD, CURRENCY_SYMBOL, getDeliveryEstimateMessage } from '@/constants/store';
import { useI18n } from '@/context/I18nContext';
import type { CartItem } from '@/types/cart';

export default function CartDrawer() {
  const { state, closeCart, removeItem, addItem, updateQuantity, decrementOrRemove, subtotal } = useCart();
  const { t } = useI18n();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(state.isOpen);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [prefetchedUrl, setPrefetchedUrl] = useState<string | null>(null);
  const [referralInput, setReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState(
    () => localStorage.getItem(REFERRAL_CODE_STORAGE_KEY) ?? '',
  );
  const [orderNote, setOrderNote] = useState(
    () => localStorage.getItem('gingerbros-cart-note') ?? '',
  );
  const [noteOpen, setNoteOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();

  const handleNoteChange = (value: string) => {
    const next = value.slice(0, 500);
    setOrderNote(next);
    if (next) {
      localStorage.setItem('gingerbros-cart-note', next);
    } else {
      localStorage.removeItem('gingerbros-cart-note');
    }
  };

  const handleShareCart = async () => {
    if (isSharing || state.items.length === 0) return;
    setIsSharing(true);
    try {
      const res = await fetch('/api/share-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: state.items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to generate link');
      await navigator.clipboard.writeText(data.url);
      toast.success('Cart link copied to clipboard! Valid for 7 days.');
    } catch {
      toast.error('Could not generate share link. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleReferralChange = (value: string) => {
    const next = value.toUpperCase();
    setReferralCode(next);
    if (next.trim()) {
      localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, next);
    } else {
      localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
    }
  };

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

  // Pre-create the Stripe checkout session in the background as soon as the cart
  // contents change, so clicking "Checkout" redirects instantly instead of waiting
  // for the API. Mixed carts pre-fetch the one-time leg, which is the first step.
  const cartKey = state.items.map(i => `${i.id}:${i.quantity}`).join('|');
  useEffect(() => {
    if (state.items.length === 0) {
      setPrefetchedUrl(null);
      return;
    }
    setPrefetchedUrl(null);
    let cancelled = false;
    const itemsToPrefetch = hasMixedCart
      ? state.items.filter(i => !i.isSubscription)
      : state.items;
    startCheckout(itemsToPrefetch, { referralCode, orderNote }).then(url => {
      if (!cancelled) setPrefetchedUrl(url);
    }).catch(() => { /* retry on click */ });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, hasMixedCart, referralCode, orderNote]);

  const handleCheckout = async () => {
    if (state.items.length === 0) return;

    // If the checkout URL was already prepared in the background, navigate instantly.
    if (!hasMixedCart && prefetchedUrl) {
      window.location.href = prefetchedUrl;
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      if (hasMixedCart) {
        // A Stripe Checkout Session can only be in one mode (payment or subscription),
        // so a mixed cart pays for its one-time items first; the success page picks up
        // the subscription leg automatically once that session completes.
        const oneTimeItems = state.items.filter((i) => !i.isSubscription);
        sessionStorage.setItem(PENDING_SUBSCRIPTION_CHECKOUT_KEY, '1');
        window.location.href = prefetchedUrl ?? await startCheckout(oneTimeItems, { referralCode, orderNote });
        return;
      }
      window.location.href = await startCheckout(state.items, { referralCode, orderNote });
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.id);
    toast(`Removed ${item.name}`, {
      action: {
        label: 'Undo',
        onClick: () => addItem(item),
      },
    });
  };

  const handleViewProduct = (item: { productId?: string; id: string }) => {
    // Prefer the catalog product id; fall back to stripping a legacy "-sub-"
    // suffix from older cart items persisted before the Stripe-driven catalog.
    const subIndex = item.id.indexOf('-sub-');
    const productId = item.productId ?? (subIndex > 0 ? item.id.slice(0, subIndex) : item.id);
    closeCart();
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
            {t('yourCart')}
          </h2>
          <button onClick={closeCart} aria-label="Close cart" data-testid="cart-close" className="text-deep-brown hover:text-rust transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBagIcon className="text-soft-peach mb-4" />
              <p className="font-body text-earth mb-2">{t('cartEmpty')}</p>
              <button onClick={closeCart} className="font-body font-medium text-rust hover:underline">
                {t('startShopping')}
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
                        {item.isSubscription && (
                          <span className="inline-block mt-1 font-body font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-deep-brown text-cream">
                            {item.interval}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item)}
                        className="text-earth hover:text-rust transition-colors flex-shrink-0 p-1.5 -m-1.5"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border border-soft-peach rounded-full px-1 py-1">
                        <button
                          onClick={() => decrementOrRemove(item.id)}
                          className="text-earth hover:text-deep-brown transition-colors p-1.5"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="font-body font-medium text-earth text-[13px] min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-earth hover:text-deep-brown transition-colors p-1.5"
                          aria-label={`Increase quantity of ${item.name}`}
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

            {/* Delivery estimate */}
            <p className="font-body text-[12px] text-green-ink">
              🚚 {getDeliveryEstimateMessage()}
            </p>

            {/* Free shipping progress */}
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <div className="bg-cream rounded-xl px-4 py-3">
                <p className="font-body text-[13px] text-earth mb-2">
                  Add <span className="font-semibold text-deep-brown">{CURRENCY_SYMBOL}{FREE_SHIPPING_THRESHOLD - subtotal}</span> more for {t('freeShippingOver').replace(/.*฿\d+/, 'free shipping')}
                </p>
                <div className="h-2 bg-soft-peach rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-green rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <div className="bg-accent-green/10 rounded-xl px-4 py-3">
                <p className="font-body text-[13px] text-green-ink font-medium">
                  🎉 {t('freeShippingUnlocked')}
                </p>
              </div>
            )}

            {/* Referral code */}
            {referralCode && !referralInput ? (
              <div className="flex items-center justify-between font-body text-[13px]">
                <span className="text-earth">
                  Referral code <span className="font-semibold text-deep-brown">{referralCode}</span> applied
                </span>
                <button
                  onClick={() => setReferralInput(true)}
                  className="text-rust hover:text-deep-brown underline"
                >
                  Change
                </button>
              </div>
            ) : referralInput || referralCode ? (
              <div className="flex items-center gap-2">
                <label htmlFor="cart-referral-code" className="sr-only">Referral code</label>
                <input
                  id="cart-referral-code"
                  value={referralCode}
                  onChange={(e) => handleReferralChange(e.target.value)}
                  placeholder="Referral code"
                  className="flex-1 bg-cream border border-soft-peach rounded-full px-4 py-2 font-body text-[13px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
                />
                <button
                  onClick={() => setReferralInput(false)}
                  className="font-body text-[13px] text-rust hover:text-deep-brown"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setReferralInput(true)}
                className="font-body text-[13px] text-rust hover:text-deep-brown underline"
              >
                Have a referral code?
              </button>
            )}

            {/* Cart note / gift message */}
            {noteOpen ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="cart-order-note" className="font-body text-[13px] text-earth">Order note / gift message</label>
                  <span className="font-body text-[11px] text-earth/50">{orderNote.length}/500</span>
                </div>
                <textarea
                  id="cart-order-note"
                  value={orderNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Any special instructions or a gift message…"
                  rows={3}
                  className="w-full bg-cream border border-soft-peach rounded-2xl px-4 py-2.5 font-body text-[13px] text-deep-brown placeholder:text-earth/40 focus:outline-none focus:ring-2 focus:ring-rust/30 resize-none"
                />
                <button
                  onClick={() => setNoteOpen(false)}
                  className="font-body text-[13px] text-rust hover:text-deep-brown"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setNoteOpen(true)}
                className="font-body text-[13px] text-rust hover:text-deep-brown underline"
              >
                {orderNote ? `Note: "${orderNote.slice(0, 40)}${orderNote.length > 40 ? '…' : ''}"` : 'Add a note or gift message'}
              </button>
            )}

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
                  {t('checkout')}
                </>
              )}
            </button>

            {checkoutError && (
              <p className="font-body text-[13px] text-center text-rust">{checkoutError}</p>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={closeCart}
                data-testid="cart-continue"
                className="font-body font-medium text-[13px] text-earth/60 hover:text-rust transition-colors"
              >
                {t('continueShopping')}
              </button>
              <button
                onClick={handleShareCart}
                disabled={isSharing}
                title="Copy a shareable link to this cart"
                className="font-body text-[13px] text-earth/60 hover:text-rust transition-colors disabled:opacity-50"
              >
                {isSharing ? '…' : '🔗 Share cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
