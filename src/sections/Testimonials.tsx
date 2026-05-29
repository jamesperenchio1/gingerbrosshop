import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StarIcon } from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: "Been looking for a good ginger beer in Thailand forever. This looks amazing!",
    source: 'TikTok',
    handle: '@craftbrewfan',
  },
  {
    quote: "The fermentation process is so cool. Love that it's all natural.",
    source: 'TikTok',
    handle: '@healthydrinksth',
  },
  {
    quote: "Just tried this at a cafe in Bangkok. Best ginger beer I've had here.",
    source: 'Instagram',
    handle: '@sarah.eats.bkk',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(headerRef.current, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.to(Array.from(cards), {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-cream py-[100px] md:py-[80px] max-md:py-[60px]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div ref={headerRef} className="opacity-0 translate-y-[30px] text-center mb-12">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            WHAT PEOPLE SAY
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)]">
            The Reviews Are In
          </h2>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.handle}
              className="opacity-0 translate-y-[40px] bg-warm-white rounded-[20px] p-8 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="text-amber" filled />
                ))}
              </div>

              {/* Quote */}
              <p className="font-body font-medium text-deep-brown italic leading-relaxed mb-6 flex-grow">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Attribution — always at bottom */}
              <div className="flex items-center gap-2 pt-4 border-t border-soft-peach/60">
                <span className="font-body font-semibold text-[11px] uppercase tracking-[0.1em] text-rust">
                  {t.source}
                </span>
                <span className="text-earth/20">|</span>
                <span className="font-body text-[13px] text-earth/60">
                  {t.handle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
