import { useRef, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router';
import { CloseIcon, TrashIcon, LockIcon, ShoppingBagIcon, PlusIcon, MinusIcon } from '@/components/Icons';

export default function CartDrawer() {
  const { state, closeCart, removeItem, updateQuantity, decrementOrRemove, subtotal } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(state.isOpen);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [cartEmail, setCartEmail] = useState('');
  const [cartEmailSaved, setCartEmailSaved] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isOpen) {
      setMounted(true);
    } else {
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

  const handleSaveCartEmail = async () => {
    if (!cartEmail.trim() || state.items.length === 0) return;
    try {
      await fetch('/api/save-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cartEmail.trim(),
          items: state.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          subtotal,
          url: window.location.origin + '/',
        }),
      });
      setCartEmailSaved(true);
    } catch {
      // silent
    }
  };

  const handleCheckout = async () => {
    if (state.items.length === 0) return;
    if (hasMixedCart) {
      setCheckoutError('Please checkout with only one-time items OR only subscription items.');
      return;
    }
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map(i => ({ id: i.id, quantity: i.quantity })),
          referralCode: referralApplied ? referralCode : '',
          giftInfo: state.items.some(i => i.isGift) ? {
            isGift: true,
            recipientEmail: state.items.find(i => i.isGift)?.recipientEmail,
            recipientName: state.items.find(i => i.isGift)?.recipientName,
            message: state.items.find(i => i.isGift)?.giftMessage,
          } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? 'Checkout failed');
      }
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const getProductId = (itemId: string) => {
    // Subscription IDs are like unpasteurized-sub-week
    const subIndex = itemId.indexOf('-sub-');
    return subIndex > 0 ? itemId.slice(0, subIndex) : itemId;
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${getProductId(productId)}`);
  };

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-[60] transition-opacity duration-300 ${
          state.isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ opacity: state.isOpen ? 1 : 0 }}
        onClick={closeCart}
      />

      <div
        ref={drawerRef}
        aria-hidden={!state.isOpen}
        inert={!state.isOpen || undefined}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-warm-white z-[70] shadow-[-8px_0_40px_rgba(61,36,16,0.1)] flex flex-col transition-transform duration-300 ${
          state.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-soft-peach/50">
          <h2 className="font-display font-semibold text-deep-brown text-[1.25rem]">
            Your Cart
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="text-deep-brown hover:text-rust transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBagIcon className="text-soft-peach mb-4" />
              <p className="font-body text-earth mb-2">Your cart is empty</p>
              <button onClick={closeCart} className="font-body font-medium text-rust hover:underline">
                Start shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-soft-peach last:border-0">
                  <button
                    onClick={() => handleViewProduct(item.id)}
                    className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-cream flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button onClick={() => handleViewProduct(item.id)}>
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
          <div className="border-t border-soft-peach/50 px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-earth">Subtotal</span>
              <span className="font-display font-semibold text-deep-brown text-xl">
                ฿{subtotal}
              </span>
            </div>
            {state.items.some(i => i.isSubscription) && (
              <p className="font-body font-medium text-[13px] text-rust mb-2">
                Subscription — billed {state.items[0]?.interval}
              </p>
            )}
            <p className="font-body font-medium text-[13px] text-earth/60 mb-2">
              {subtotal >= 500 ? 'Free shipping unlocked!' : 'Free shipping on orders over ฿500'}
            </p>
            <p className="font-body font-medium text-[13px] text-earth/60 mb-5">
              Shipping & payment handled securely on Stripe
            </p>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-deep-brown text-cream font-body font-medium text-sm uppercase tracking-[0.08em] py-4 rounded-full hover:bg-rust active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-90"
            >
              {isCheckingOut ? (
                <>
                  <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  <span>Redirecting to Stripe…</span>
                </>
              ) : (
                <>
                  <LockIcon />
                  Checkout with Stripe
                </>
              )}
            </button>

            {checkoutError && (
              <p className="mt-3 font-body text-[13px] text-center text-rust">
                {checkoutError}
              </p>
            )}

            {/* Abandoned cart email capture */}
            {state.items.length > 0 && !cartEmailSaved && (
              <div className="mt-4 pt-4 border-t border-soft-peach/50">
                <p className="font-body text-[12px] text-earth mb-2">Enter your email to save this cart:</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={cartEmail}
                    onChange={(e) => setCartEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-cream border border-soft-peach rounded-full px-4 py-2 font-body text-[13px] text-deep-brown placeholder:text-earth/40 focus:outline-none focus:ring-2 focus:ring-rust/30"
                  />
                  <button
                    onClick={handleSaveCartEmail}
                    className="bg-deep-brown text-cream font-body text-[12px] px-4 py-2 rounded-full hover:bg-rust transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            {cartEmailSaved && (
              <p className="mt-3 font-body text-[12px] text-center text-accent-green">
                Cart saved! We will remind you if you do not checkout.
              </p>
            )}

            {/* Referral code */}
            {!referralApplied && state.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-soft-peach/50">
                <p className="font-body text-[12px] text-earth mb-2">Have a referral code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="BROXXXX"
                    className="flex-1 bg-cream border border-soft-peach rounded-full px-4 py-2 font-body text-[13px] text-deep-brown placeholder:text-earth/40 focus:outline-none focus:ring-2 focus:ring-rust/30 uppercase"
                  />
                  <button
                    onClick={async () => {
                      setReferralError('');
                      try {
                        const res = await fetch('/api/apply-referral', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ code: referralCode, email: cartEmail || 'guest@gingerbrosshop.com' }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        setReferralApplied(true);
                      } catch (err) {
                        setReferralError(err instanceof Error ? err.message : 'Invalid code');
                      }
                    }}
                    className="bg-deep-brown text-cream font-body text-[12px] px-4 py-2 rounded-full hover:bg-rust transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {referralError && <p className="mt-1 font-body text-[11px] text-rust">{referralError}</p>}
              </div>
            )}
            {referralApplied && (
              <p className="mt-3 font-body text-[12px] text-center text-accent-green">
                Referral code applied! Both you and your friend earned 50 points.
              </p>
            )}

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-earth/10" />
              <span className="font-body font-medium text-[13px] text-earth/40">or</span>
              <div className="flex-1 h-px bg-earth/10" />
            </div>

            <button
              onClick={closeCart}
              className="w-full text-center font-body font-medium text-rust hover:underline transition-all"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
