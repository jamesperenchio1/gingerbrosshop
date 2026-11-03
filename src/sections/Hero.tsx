import { useRef } from 'react';
import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import { useReveal } from '@/lib/reveal';
import ResponsiveImage from '@/components/ResponsiveImage';

/**
 * Charcoal stage, poster-size type, the two real bottles lit from behind.
 * The headline is the LCP element (text, so it paints with the first byte);
 * the bottles are high-priority responsive images.
 */
export default function Hero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const bottlesRef = useRef<HTMLDivElement>(null);

  // Only the bottles animate in: the headline is the LCP element and must
  // paint with the first frame.
  useReveal(sectionRef, (reveal) => {
    reveal(bottlesRef.current, { y: 40, scale: 0.96, duration: 0.9, delay: 0.25, immediate: true });
  });

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-charcoal text-cream"
    >
      {/* Warm glow + grain, pure CSS. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_75%_55%,rgba(242,182,50,0.35),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgba(139,90,43,0.35),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-6 px-4 pb-14 pt-28 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pb-20 md:pt-32 lg:min-h-[min(100svh,880px)]">
        <div className="relative z-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-1.5 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-cream/90">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ginger" />
            {t('heroBadge')}
          </p>
          <h1 id="hero-title" className="font-poster text-[clamp(3.4rem,11vw,8.75rem)]">
            <span className="block">{t('heroHeadline1')}</span>
            <span className="block text-ginger">{t('heroHeadline2')}</span>
          </h1>
          <p className="mt-6 max-w-[520px] font-body text-[17px] leading-relaxed text-cream/85 md:text-[18px]">{t('heroSub')}</p>
          <div className="mt-8 flex flex-col gap-3 xs:flex-row">
            <Link
              to="/shop"
              className="rounded-full bg-ginger px-8 py-4 text-center font-body text-[14px] font-bold uppercase tracking-[0.1em] text-charcoal transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {t('heroCtaShop')} →
            </Link>
            <Link
              to="/guide"
              className="rounded-full border-2 border-cream/40 px-8 py-4 text-center font-body text-[14px] font-bold uppercase tracking-[0.1em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-charcoal"
            >
              {t('heroCtaStory')}
            </Link>
          </div>
          <p className="mt-6 font-body text-[13px] text-cream/75">{t('heroPerks')}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-[14px] font-semibold text-cream/90">
            {[t('heroTrust1'), t('heroTrust2'), t('heroTrust3')].map((label) => (
              <li key={label} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-ginger">✦</span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div ref={bottlesRef} className="relative mx-auto flex h-[360px] w-full max-w-[460px] items-end justify-center sm:h-[460px] md:h-[600px]">
          <div aria-hidden="true" className="absolute bottom-[4%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />
          <ResponsiveImage
            name="bottle-tea"
            alt="GingerBros Ginger Tea bottle"
            priority
            sizes="(min-width: 768px) 170px, 110px"
            className="relative z-0 h-[88%] w-auto -mr-6 rotate-[-6deg] drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)] sm:-mr-8"
          />
          <ResponsiveImage
            name="bottle-fizz"
            alt="GingerBros Ginger Fizz bottle"
            priority
            sizes="(min-width: 768px) 180px, 120px"
            className="relative z-10 h-full w-auto rotate-[4deg] drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
          />
        </div>
      </div>
    </section>
  );
}
