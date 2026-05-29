import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GutHealthIcon, LeafIcon, LightningIcon } from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

const BENEFITS = [
  {
    icon: GutHealthIcon,
    title: 'Gut Health',
    description: "Ginger contains natural prebiotic compounds. Our unpasteurized brew delivers live cultures too. Good for the gut, however you drink it.",
  },
  {
    icon: LeafIcon,
    title: 'All Natural',
    description: 'Just four ingredients: ginger, water, sugar, and live cultures. No artificial anything. Brewed the way it should be.',
  },
  {
    icon: LightningIcon,
    title: 'Vitamin B Rich',
    description: 'The natural fermentation process produces B vitamins that support energy metabolism and overall wellness.',
  },
];

export default function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.to(Array.from(cards), {
          opacity: 1,
          y: 0,
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
        <div ref={headerRef} className="opacity-0 translate-y-[30px] text-center mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            WHY GINGER BEER
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)]">
            More Than a Drink
          </h2>
        </div>

        {/* Benefits Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="opacity-0 translate-y-[40px] text-center"
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
      </div>
    </section>
  );
}
