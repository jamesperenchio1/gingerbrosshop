import { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import NoiseCanvas from '@/components/NoiseCanvas';
import BubbleCanvas from '@/components/BubbleCanvas';
import { ChevronDownIcon } from '@/components/Icons';
import { useI18n } from '@/context/I18nContext';
import { prefersReducedMotion } from '@/lib/reveal';

export default function Hero() {
  const { t } = useI18n();

  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    // Scoped to a context so unmounting reverts every inline style GSAP wrote.
    // (A bare `tl.kill()` leaves whatever opacity the tween had reached, which
    // is how the hero could come back half-faded after a route change.)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        // Nothing here should be able to leave an element invisible.
        onComplete: () => gsap.set(
          [badgeRef.current, headlineRef.current, subRef.current, ctaRef.current, trustRef.current, scrollRef.current],
          { clearProps: 'opacity,transform' },
        ),
      });
      tl.from(badgeRef.current, { opacity: 0, y: -10, duration: 0.5, delay: 0.15 })
        .from(headlineRef.current, { opacity: 0, y: 30, duration: 0.8 }, '-=0.2')
        .from(subRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from(ctaRef.current, { opacity: 0, y: 15, duration: 0.5 }, '-=0.3')
        .from(trustRef.current, { opacity: 0, y: 10, duration: 0.5 }, '-=0.3')
        .from(imageRef.current, { opacity: 0, y: 30, scale: 0.94, duration: 0.9 }, '-=0.9')
        .from(scrollRef.current, { opacity: 0, duration: 0.5 }, '-=0.2');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Gentle looping float for the bottle + mug group.
  useEffect(() => {
    if (!imageRef.current || prefersReducedMotion()) return;
    const tween = gsap.to(imageRef.current, {
      y: -14,
      duration: 2.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 4,
    });
    return () => { tween.revert(); };
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
      ref={sectionRef}
      className="relative w-full min-h-[540px] sm:min-h-[600px] md:min-h-[700px] md:h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #E8C97A 0%, #D4A34B 40%, #C9963A 100%)' }}
    >
      <NoiseCanvas />
      <BubbleCanvas />

      <div className="relative z-10 w-full max-w-[1120px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center pt-16 sm:pt-20 pb-36 md:py-0">
        {/* Left: copy */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
          <div ref={badgeRef} className="mb-2 md:mb-5">
            <span className="inline-block bg-cream text-deep-brown font-body font-medium text-[12px] md:text-[13px] px-4 py-1.5 md:px-5 md:py-2 rounded-full">
              {t('heroBadge')}
            </span>
          </div>

          <h1
            ref={headlineRef}
            className="font-display font-bold text-deep-brown leading-[0.95] mb-2 md:mb-4 text-[clamp(1.75rem,8vw,2.5rem)] md:text-[clamp(2.5rem,6vw,4.75rem)]"
          >
            {t('heroHeadline1')}
            <br />
            {t('heroHeadline2')}
          </h1>

          <p
            ref={subRef}
            className="font-body font-medium text-[14px] md:text-[15px] text-earth max-w-[460px] mb-4 md:mb-7 leading-relaxed"
          >
            {t('heroSub')}
          </p>

          <div ref={ctaRef} className="flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center justify-center md:justify-start gap-2 md:gap-3">
            <button
              onClick={handleShopClick}
              className="bg-deep-brown text-cream font-body font-medium text-sm uppercase tracking-[0.08em] px-7 py-3 md:px-9 md:py-3.5 rounded-full hover:bg-rust hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
            >
              {t('heroCtaShop')}
            </button>
            <button
              onClick={handleStoryClick}
              className="bg-transparent text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-7 py-3 md:px-9 md:py-3.5 rounded-full border-2 border-deep-brown hover:bg-deep-brown hover:text-cream active:scale-[0.98] transition-all duration-200 text-center"
            >
              {t('heroCtaStory')}
            </button>
          </div>

          {/* Trust row */}
          <div ref={trustRef} className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 md:gap-x-3 gap-y-1 mt-4 md:mt-7">
            {[t('heroTrust1'), t('heroTrust2'), t('heroTrust3')].map((label, i, arr) => (
              <span key={label} className="flex items-center gap-x-2 md:gap-x-3 font-body font-semibold text-[13px] md:text-[15px] text-deep-brown/90">
                {label}
                {i < arr.length - 1 && <span aria-hidden="true" className="text-[16px] md:text-[20px] leading-none">·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Right: product shot */}
        <div ref={imageRef} className="flex justify-center md:justify-end order-1 md:order-2">
          <div className="relative flex items-end justify-center md:justify-end gap-2 sm:gap-4 group">
            <picture>
              <source srcSet="/images/hero-mug.webp" type="image/webp" />
              <img
                src="/images/hero-mug.png"
                alt="Frosty mug of GingerBros Ginger Fizz"
                width={480}
                height={712}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-[90px] xs:w-[110px] sm:w-[160px] md:w-[240px] block drop-shadow-[0_16px_32px_rgba(80,45,8,0.22)] rotate-[-6deg] sm:rotate-[-4deg] md:rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500"
              />
            </picture>
            <picture>
              <source srcSet="/images/bottle-hero-transparent.webp" type="image/webp" />
              <img
                src="/images/bottle-hero-transparent.png"
                alt="GingerBros Ginger Fizz bottle"
                width={195}
                height={759}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-[70px] xs:w-[85px] sm:w-[110px] md:w-[150px] block drop-shadow-[0_24px_48px_rgba(80,45,8,0.32)] rotate-[3deg] group-hover:rotate-0 transition-transform duration-500"
              />
            </picture>
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
