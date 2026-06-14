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
}

const PRODUCTS: ProductDef[] = [
  {
    id: 'unpasteurized',
    name: 'Unpasteurized Ginger Beer',
    shortDescription: 'Raw, living ginger beer with active cultures. Must be kept refrigerated. 330ml per bottle.',
    price: 140,
    image: '/images/product-unpasteurized-2.jpg',
    badge: 'CHILLED DELIVERY',
    badgeColor: 'bg-grab-green',
    borderStyle: 'border-2 border-dashed border-soft-peach',
    bgColor: 'bg-warm-white',
    addable: true,
  },
];

export default function Shop() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [quantities, setQuantities] = useState<Record<string, number>>({
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
      variant: 'unpasteurized',
      price: product.price,
      quantity: quantities[product.id] ?? 1,
      image: product.image,
      badge: product.badge,
      badgeColor: product.badgeColor,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 800);
  };

  const getDetailLink = (product: ProductDef) => `/product/${product.id}`;

  return (
    <section id="shop" ref={sectionRef} className="bg-warm-white py-[120px] md:py-[80px] max-md:py-[60px]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div ref={headerRef} className="opacity-0 translate-y-[40px] text-center mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            OUR PRODUCT
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            Choose Your Brew
          </h2>
          <p className="font-body text-earth">
            Fresh, raw ginger beer delivered chilled to your door.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`opacity-0 translate-y-[50px] scale-[0.96] ${product.bgColor} ${product.borderStyle} rounded-[20px] p-8 flex flex-col md:col-start-2`}
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
                  per bottle
                </span>
              </div>

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
                {addedId === product.id ? 'Added!' : `Add to Cart — ฿${product.price}`}
              </button>

              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 bg-accent-green rounded-full" />
                <span className="font-body font-medium text-[13px] text-earth">In Stock</span>
              </div>

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
