import { useRef, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router';
import { CloseIcon, TrashIcon, LockIcon, ShoppingBagIcon, PlusIcon, MinusIcon } from '@/components/Icons';

export default function CartDrawer() {
  const { state, closeCart, removeItem, updateQuantity, decrementOrRemove, subtotal } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (state.isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [state.isOpen, closeCart]);

  const handleCheckout = async () => {
    if (state.items.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map(i => ({ id: i.id, quantity: i.quantity })),
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

  const handleViewProduct = (productId: string) => {
    closeCart();
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-[60] transition-opacity duration-300 ${
          state.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-warm-white z-[70] shadow-[-8px_0_40px_rgba(61,36,16,0.1)] flex flex-col transition-transform duration-300 ${
          state.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-soft-peach/50">
          <h2 className="font-display font-semibold text-deep-brown text-[1.25rem]">
            Your Cart
          </h2>
          <button onClick={closeCart} className="text-deep-brown hover:text-rust transition-colors">
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
                        <span className={`inline-block mt-1 font-body font-semibold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                          {item.badge}
                        </span>
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
            <p className="font-body font-medium text-[13px] text-earth/60 mb-5">
              Shipping calculated at checkout
            </p>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-deep-brown text-cream font-body font-medium text-sm uppercase tracking-[0.08em] py-4 rounded-full hover:bg-rust active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isCheckingOut ? (
                <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
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
