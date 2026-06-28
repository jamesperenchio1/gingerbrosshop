import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import NoiseCanvas from '@/components/NoiseCanvas';
import BubbleCanvas from '@/components/BubbleCanvas';
import { ChevronDownIcon } from '@/components/Icons';

export default function Hero() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(badgeRef.current, { opacity: 0, y: -10, duration: 0.5, delay: 0.15 })
      .from(headlineRef.current, { opacity: 0, y: 30, duration: 0.8 }, '-=0.2')
      .from(subRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from(ctaRef.current, { opacity: 0, y: 15, duration: 0.5 }, '-=0.3')
      .from(trustRef.current, { opacity: 0, y: 10, duration: 0.5 }, '-=0.3')
      .from(imageRef.current, { opacity: 0, y: 30, scale: 0.94, duration: 0.9 }, '-=0.9')
      .from(scrollRef.current, { opacity: 0, duration: 0.5 }, '-=0.2');

    return () => { tl.kill(); };
  }, []);

  const handleShopClick = () => {
    const el = document.querySelector('#shop');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStoryClick = () => {
    const el = document.querySelector('#story');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-[640px] md:min-h-[700px] md:h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #E8C97A 0%, #D4A34B 40%, #C9963A 100%)' }}
    >
      <NoiseCanvas />
      <BubbleCanvas />

      <div className="relative z-10 w-full max-w-[1120px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center py-24 md:py-0">
        {/* Left: copy */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
          <div ref={badgeRef} className="mb-5">
            <span className="inline-block bg-cream text-deep-brown font-body font-medium text-[13px] px-5 py-2 rounded-full">
              GingerBros · Naturally Brewed in Thailand
            </span>
          </div>

          <h1
            ref={headlineRef}
            className="font-display font-bold text-deep-brown leading-[0.95] mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.75rem)' }}
          >
            Fermented Ginger,
            <br />
            Your Way
          </h1>

          <p
            ref={subRef}
            className="font-body font-medium text-[15px] text-earth max-w-[460px] mb-7 leading-relaxed"
          >
            A bold ginger kick with prebiotic acacia fibre. 7-day naturally fermented, low in sugar, and made with real ingredients.
          </p>

          <div ref={ctaRef} className="flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center justify-center md:justify-start gap-3">
            <button
              onClick={handleShopClick}
              className="bg-deep-brown text-cream font-body font-medium text-sm uppercase tracking-[0.08em] px-9 py-3.5 rounded-full hover:bg-rust hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
            >
              Shop the Brews
            </button>
            <button
              onClick={handleStoryClick}
              className="bg-transparent text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-9 py-3.5 rounded-full border-2 border-deep-brown hover:bg-deep-brown hover:text-cream active:scale-[0.98] transition-all duration-200 text-center"
            >
              Our Story
            </button>
          </div>

          {/* Trust row */}
          <div ref={trustRef} className="flex items-center justify-center md:justify-start gap-x-3 mt-7">
            {['7-day ferment', '<2g sugar', 'Prebiotic fibre'].map((label, i, arr) => (
              <span key={label} className="flex items-center gap-x-3 font-body font-semibold text-[15px] text-deep-brown/90">
                {label}
                {i < arr.length - 1 && <span aria-hidden="true" className="text-[20px] leading-none">·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Right: product shot */}
        <div ref={imageRef} className="flex justify-center md:justify-end order-1 md:order-2">
          <div className="relative md:rounded-[28px] md:overflow-hidden md:shadow-[0_28px_72px_rgba(80,45,8,0.32)] md:ring-1 md:ring-black/5">
            <img
              src="/images/product-ginger-fizz.png"
              alt="GingerBros Ginger Fizz bottle"
              width={420}
              height={560}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-[180px] sm:w-[220px] md:w-[340px] block drop-shadow-[0_20px_40px_rgba(80,45,8,0.30)]"
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <ChevronDownIcon className="text-earth/40 animate-bounce-gentle" />
      </div>
    </section>
  );
}
