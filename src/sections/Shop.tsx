import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '@/context/CartContext';
import { PlusIcon, MinusIcon } from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

interface ProductDef {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
  image: string;
  badge: string;
  badgeColor: string;
  borderStyle: string;
  bgColor: string;
  addable: boolean;
  isBundle?: boolean;
  bundleSize?: number;
}

const PRODUCTS: ProductDef[] = [
  {
    id: 'pasteurized',
    name: 'Pasteurized Ginger Beer',
    shortDescription: 'Our signature craft ginger beer, shelf-stable and ready to ship. Same great taste, longer lasting. 330ml per bottle.',
    price: 120,
    image: '/images/product-pasteurized.png',
    badge: 'AVAILABLE EVERYWHERE',
    badgeColor: 'bg-accent-green',
    borderStyle: 'border-none',
    bgColor: 'bg-cream',
    addable: true,
  },
  {
    id: 'pasteurized-6pack',
    name: '6-Pack Bundle',
    shortDescription: 'Six bottles of our pasteurized ginger beer at a better price. Perfect for sharing or stocking up. 6 x 330ml.',
    price: 650,
    image: '/images/bundle-6pack.jpg',
    badge: 'BEST VALUE',
    badgeColor: 'bg-amber',
    borderStyle: 'border-none',
    bgColor: 'bg-cream',
    addable: true,
    isBundle: true,
    bundleSize: 6,
  },
  {
    id: 'unpasteurized',
    name: 'Unpasteurized Ginger Beer',
    shortDescription: 'Fresh, living ginger beer with active cultures. More probiotics, more kick. Only available on Grab for now. 330ml per bottle.',
    price: 140,
    image: '/images/product-unpasteurized.png',
    badge: 'GRAB EXCLUSIVE',
    badgeColor: 'bg-grab-green',
    borderStyle: 'border-2 border-dashed border-soft-peach',
    bgColor: 'bg-warm-white',
    addable: false,
  },
];

export default function Shop() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [quantities, setQuantities] = useState<Record<string, number>>({
    pasteurized: 1,
    'pasteurized-6pack': 1,
    unpasteurized: 1,
  });
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(headerRef.current, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.to(Array.from(cards), {
          opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(24, (prev[id] ?? 1) + delta)),
    }));
  };

  const handleAddToCart = (product: ProductDef) => {
    addItem({
      id: product.id,
      name: product.name,
      variant: product.id.includes('unpasteurized') ? 'unpasteurized' : 'pasteurized',
      price: product.price,
      quantity: quantities[product.id] ?? 1,
      image: product.image,
      badge: product.badge,
      badgeColor: product.badgeColor,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 800);
  };

  const getDetailLink = (product: ProductDef) => {
    if (product.id === 'pasteurized-6pack') return '/product/pasteurized';
    return `/product/${product.id}`;
  };

  return (
    <section id="shop" ref={sectionRef} className="bg-warm-white py-[120px] md:py-[80px] max-md:py-[60px]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div ref={headerRef} className="opacity-0 translate-y-[40px] text-center mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            OUR PRODUCTS
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            Choose Your Brew
          </h2>
          <p className="font-body text-earth">
            Single bottles and bundles. Select your ginger beer below.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`opacity-0 translate-y-[50px] scale-[0.96] ${product.bgColor} ${product.borderStyle} rounded-[20px] p-8 flex flex-col`}
            >
              {/* Product Image */}
              <button
                onClick={() => navigate(getDetailLink(product))}
                className="flex items-center justify-center mb-6 h-[220px] hover:opacity-90 transition-opacity"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain drop-shadow-lg rounded-lg"
                />
              </button>

              {/* Badge */}
              <span className={`inline-block self-start ${product.badgeColor} text-white font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full mb-3`}>
                {product.badge}
              </span>

              {/* Product Name */}
              <button onClick={() => navigate(getDetailLink(product))} className="text-left">
                <h3 className="font-display font-semibold text-deep-brown text-[1.15rem] mb-2 hover:text-rust transition-colors">
                  {product.name}
                </h3>
              </button>

              {/* Description */}
              <p className="font-body text-earth text-[14px] leading-relaxed mb-4 flex-grow">
                {product.shortDescription}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display font-semibold text-deep-brown text-2xl">
                  ฿{product.price}
                </span>
                <span className="font-body font-medium text-[13px] text-rust">
                  {product.isBundle ? `for ${product.bundleSize} bottles` : 'per bottle'}
                </span>
                {product.isBundle && (
                  <span className="font-body font-medium text-[11px] text-accent-green ml-1">
                    Save ฿70
                  </span>
                )}
              </div>

              {product.addable ? (
                <>
                  <div className="flex items-center justify-center gap-4 mb-4 border-2 border-soft-peach rounded-full py-2 px-4 self-start">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="text-earth hover:text-deep-brown transition-colors"
                    >
                      <MinusIcon />
                    </button>
                    <span className="font-body font-medium text-earth min-w-[20px] text-center">
                      {quantities[product.id] ?? 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="text-earth hover:text-deep-brown transition-colors"
                    >
                      <PlusIcon />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full transition-all duration-200 ${
                      addedId === product.id
                        ? 'bg-accent-green text-white'
                        : 'bg-amber text-deep-brown hover:bg-warm-gold active:scale-[0.98]'
                    }`}
                  >
                    {addedId === product.id ? 'Added!' : 'Add to Cart'}
                  </button>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="w-2 h-2 bg-accent-green rounded-full" />
                    <span className="font-body font-medium text-[13px] text-earth">In Stock</span>
                  </div>

                  {/* Cross-sell 6-pack on single bottle */}
                  {product.id === 'pasteurized' && (
                    <button
                      onClick={() => navigate('/product/pasteurized-6pack')}
                      className="mt-4 w-full bg-warm-gold/15 border border-warm-gold/30 rounded-xl p-3 flex items-center gap-3 hover:bg-warm-gold/25 transition-colors text-left"
                    >
                      <img
                        src="/images/bundle-6pack.jpg"
                        alt="6-Pack Bundle"
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-body font-semibold text-[12px] uppercase tracking-wider text-deep-brown block">
                          Upgrade to 6-Pack
                        </span>
                        <span className="font-body text-[12px] text-earth">
                          6 bottles for ฿650 — Save ฿70
                        </span>
                      </div>
                      <span className="font-body font-semibold text-[12px] text-accent-green flex-shrink-0">
                        Save
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full font-body font-medium text-sm uppercase tracking-[0.08em] py-3.5 rounded-full bg-soft-peach text-earth/50 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    Available on Grab
                  </button>
                  <a
                    href="https://www.grab.com/th/en/food/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center font-body font-medium text-[13px] text-grab-green hover:underline mt-3 transition-all"
                  >
                    Order on Grab instead
                  </a>
                </>
              )}

              {/* View Details Link */}
              <button
                onClick={() => navigate(getDetailLink(product))}
                className="mt-4 text-center font-body font-medium text-[13px] text-rust hover:text-deep-brown hover:underline transition-all"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
