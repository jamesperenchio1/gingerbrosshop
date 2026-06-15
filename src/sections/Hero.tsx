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
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(badgeRef.current, { opacity: 0, y: -10, duration: 0.5, delay: 0.2 })
      .from(headlineRef.current, { opacity: 0, y: 30, duration: 0.8 }, '-=0.2')
      .from(subRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from(ctaRef.current, { opacity: 0, y: 15, duration: 0.5 }, '-=0.3')
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
      className="relative w-full min-h-[700px] h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #E8C97A 0%, #D4A34B 40%, #C9963A 100%)' }}
    >
      <NoiseCanvas />
      <BubbleCanvas />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[900px]">
        {/* Badge */}
        <div
          ref={badgeRef}
          className="mb-6"
        >
          <span className="inline-block bg-cream text-deep-brown font-body font-medium text-sm px-5 py-2 rounded-full">
            Naturally Brewed in Thailand
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-display font-bold text-deep-brown leading-[0.95] mb-4"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
        >
          GingerBros
          <br />
          Ginger Fizz
        </h1>

        {/* Subheadline */}
        <p
          ref={subRef}
          className="font-body font-medium text-[15px] text-earth max-w-[500px] mb-8 leading-relaxed"
        >
          7-day naturally fermented craft ginger fizz. Low in sugar, good for the gut. Our unpasteurized brew is packed with live probiotics.
        </p>

        {/* CTA Row */}
        <div
          ref={ctaRef}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={handleShopClick}
            className="bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-9 py-3.5 rounded-full hover:bg-warm-gold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Shop Now
          </button>
          <button
            onClick={handleStoryClick}
            className="bg-transparent text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-9 py-3.5 rounded-full border-2 border-deep-brown hover:bg-deep-brown hover:text-cream active:scale-[0.98] transition-all duration-200"
          >
            Our Story
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDownIcon className="text-earth/40 animate-bounce-gentle" />
      </div>
    </section>
  );
}
