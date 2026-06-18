import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GutHealthIcon, LeafIcon, LightningIcon, SnowflakeIcon } from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

const BENEFITS = [
  {
    icon: GutHealthIcon,
    title: 'Gut Health',
    description: "Ginger contains natural prebiotic compounds, and because we never pasteurize, our brew also delivers live fermentation cultures — prebiotic and probiotic in every bottle.",
  },
  {
    icon: LeafIcon,
    title: 'All Natural',
    description: 'Just four ingredients: ginger, water, sugar, and live cultures. No additives, no preservatives, no artificial anything. Brewed the way it should be.',
  },
  {
    icon: LightningIcon,
    title: 'Vitamin B Rich',
    description: 'The slow natural ferment produces B vitamins that support energy metabolism — a gentle, real-food lift with no caffeine and no crash.',
  },
  {
    icon: SnowflakeIcon,
    title: 'Soothes & Settles',
    description: 'Real ginger is a time-tested remedy for nausea, bloating, and sluggish digestion. Our fizz makes the daily dose something you actually look forward to.',
  },
];

// Quick, scannable facts that reinforce the "why" without a wall of text.
const FACTS = [
  { stat: 'Low', label: 'in sugar' },
  { stat: '7 days', label: 'naturally fermented' },
  { stat: 'Never', label: 'heated or filtered' },
  { stat: '330ml', label: 'live, raw & chilled' },
];

export default function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.from(Array.from(cards), {
          opacity: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="benefits"
      ref={sectionRef}
      className="bg-warm-white py-[120px] md:py-[80px] max-md:py-[60px]"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            WHY GINGER FIZZ
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            More Than a Drink
          </h2>
          <p className="font-body text-earth max-w-[560px] mx-auto">
            For centuries ginger has been used to calm the stomach and fire up digestion. We just brew it the old, slow way — alive, raw, and barely sweet — so it does you good and tastes like it means it.
          </p>
        </div>

        {/* Benefits Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="text-center"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cream rounded-full mb-5">
                  <Icon className="text-rust" />
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-deep-brown text-[1.125rem] mb-3">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="font-body text-earth leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick facts strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="bg-cream rounded-2xl px-4 py-6 text-center"
            >
              <p className="font-display font-bold text-deep-brown text-2xl sm:text-3xl leading-none mb-1.5">
                {fact.stat}
              </p>
              <p className="font-body text-earth text-[13px] leading-snug">{fact.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
