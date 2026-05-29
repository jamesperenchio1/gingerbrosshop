import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon } from '@/components/Icons';

export default function StickyCartBar() {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const shopSection = document.querySelector('#shop');
      if (!shopSection) return;
      const rect = shopSection.getBoundingClientRect();
      // Show bar after shop section scrolls past top
      setVisible(rect.bottom < 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAdd = () => {
    addItem({
      id: 'pasteurized',
      name: 'Pasteurized Ginger Beer',
      variant: 'pasteurized',
      price: 120,
      quantity,
      image: '/images/product-pasteurized.png',
      badge: 'AVAILABLE EVERYWHERE',
      badgeColor: 'bg-accent-green',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div
      ref={barRef}
      className={`fixed bottom-0 left-0 right-0 z-40 bg-warm-white/95 backdrop-blur-lg shadow-[0_-4px_24px_rgba(61,36,16,0.08)] transition-transform duration-400 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Product Info */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/images/product-pasteurized.png"
            alt="Pasteurized Ginger Beer"
            className="w-12 h-12 rounded-lg object-contain bg-cream"
          />
          <div className="hidden sm:block min-w-0">
            <span className="font-body font-medium text-deep-brown text-[15px] truncate block">
              Pasteurized Ginger Beer
            </span>
            <span className="font-body font-medium text-[13px] text-rust">
              ฿120
            </span>
          </div>
        </div>

        {/* Center: Quantity */}
        <div className="flex items-center gap-3 border-2 border-soft-peach rounded-full px-3 py-1.5">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-earth hover:text-deep-brown transition-colors"
          >
            <MinusIcon className="w-3.5 h-3.5" />
          </button>
          <span className="font-body font-medium text-earth text-[14px] min-w-[20px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(24, quantity + 1))}
            className="text-earth hover:text-deep-brown transition-colors"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Add Button */}
        <button
          onClick={handleAdd}
          className={`font-body font-medium text-sm uppercase tracking-[0.08em] px-7 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] flex-shrink-0 ${
            added
              ? 'bg-accent-green text-white'
              : 'bg-amber text-deep-brown hover:bg-warm-gold'
          }`}
        >
          {added ? 'Added!' : `Add to Cart — ฿${120 * quantity}`}
        </button>
      </div>
    </div>
  );
}
