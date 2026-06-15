import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon, SnowflakeIcon } from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

const PRODUCT = {
  id: 'unpasteurized',
  name: 'Unpasteurized Ginger Fizz',
  shortDescription: 'Raw, living ginger fizz with active cultures. Must be kept refrigerated. 330ml per bottle.',
  price: 140,
  image: '/images/product-unpasteurized-2.jpg',
  badge: 'Chilled Delivery',
  badgeColor: 'bg-sky-500',
};

const DETAIL_LINK = `/product/${PRODUCT.id}`;

export default function Shop() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.from(Array.from(cards), {
          opacity: 0, y: 50, scale: 0.96, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const changeQuantity = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(24, prev + delta)));
  };

  const handleAddToCart = () => {
    addItem({
      id: PRODUCT.id,
      name: PRODUCT.name,
      variant: 'unpasteurized',
      price: PRODUCT.price,
      quantity,
      image: PRODUCT.image,
      badge: PRODUCT.badge,
      badgeColor: PRODUCT.badgeColor,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <section id="shop" ref={sectionRef} className="bg-warm-white py-[120px] md:py-[80px] max-md:py-[60px]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div ref={headerRef} className="text-center mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            OUR PRODUCT
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            Choose Your Brew
          </h2>
          <p className="font-body text-earth">
            Fresh, raw ginger fizz delivered chilled to your door.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-soft-peach/60 shadow-[0_12px_40px_rgba(61,36,16,0.10)] rounded-[24px] p-8 flex flex-col md:col-start-2">
            {/* Product Image */}
            <button
              onClick={() => navigate(DETAIL_LINK)}
              className="flex items-center justify-center mb-6 h-[240px] rounded-2xl overflow-hidden bg-warm-white hover:opacity-95 transition-opacity"
            >
              <img
                src={PRODUCT.image}
                alt={PRODUCT.name}
                className="h-full w-full object-cover"
              />
            </button>

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 self-start bg-sky-50 text-sky-700 border border-sky-200/80 font-body font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full mb-3">
              <SnowflakeIcon className="w-3.5 h-3.5" />
              {PRODUCT.badge}
            </span>

            {/* Product Name */}
            <button onClick={() => navigate(DETAIL_LINK)} className="text-left">
              <h3 className="font-display font-semibold text-deep-brown text-[1.15rem] mb-2 hover:text-rust transition-colors">
                {PRODUCT.name}
              </h3>
            </button>

            {/* Description */}
            <p className="font-body text-earth text-[14px] leading-relaxed mb-4 flex-grow">
              {PRODUCT.shortDescription}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display font-semibold text-deep-brown text-2xl">
                ฿{PRODUCT.price}
              </span>
              <span className="font-body font-medium text-[13px] text-rust">
                per bottle
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4 border-2 border-soft-peach rounded-full py-2 px-4 self-start">
              <button
                onClick={() => changeQuantity(-1)}
                className="text-earth hover:text-deep-brown transition-colors"
                aria-label="Decrease quantity"
              >
                <MinusIcon />
              </button>
              <span className="font-body font-medium text-earth min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => changeQuantity(1)}
                className="text-earth hover:text-deep-brown transition-colors"
                aria-label="Increase quantity"
              >
                <PlusIcon />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              data-testid="add-to-cart"
              className={`w-full font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full transition-all duration-200 ${
                added
                  ? 'bg-accent-green text-white'
                  : 'bg-amber text-deep-brown hover:bg-warm-gold active:scale-[0.98]'
              }`}
            >
              {added ? 'Added!' : `Add to Cart — ฿${PRODUCT.price}`}
            </button>

            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 bg-accent-green rounded-full" />
              <span className="font-body font-medium text-[13px] text-earth">In Stock</span>
            </div>

            {/* View Details Link */}
            <button
              onClick={() => navigate(DETAIL_LINK)}
              className="mt-4 text-center font-body font-medium text-[13px] text-rust hover:text-deep-brown hover:underline transition-all"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
