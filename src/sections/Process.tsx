import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: '01',
    days: 'Day 1-2',
    title: 'Ginger & Sugar',
    description: 'Fresh ginger is grated and combined with raw sugar and filtered water. The ginger bug — our live culture starter — is added to begin the fermentation.',
  },
  {
    number: '02',
    days: 'Day 3-5',
    title: 'Natural Ferment',
    description: 'Wild yeast and beneficial bacteria transform the sugars. Bubbles begin to form as CO2 develops naturally. The brew develops its signature bite.',
  },
  {
    number: '03',
    days: 'Day 6-7',
    title: 'Condition & Bottle',
    description: 'The ginger fizz is strained, conditioned for flavor development, then carefully bottled to capture natural carbonation.',
  },
  {
    number: '04',
    days: 'Ready',
    title: 'Enjoy Cold',
    description: 'Chill thoroughly before opening. Expect a lively pop — this is living, effervescent ginger fizz at its finest.',
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0, y: 30, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.from(Array.from(cards), {
          opacity: 0, y: 40, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="bg-amber py-[120px] md:py-[80px] max-md:py-[60px]">
      <div className="max-w-[1000px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-cream mb-3 block">
            THE PROCESS
          </span>
          <h2 className="font-display font-semibold text-cream text-[clamp(1.5rem,3vw,2.5rem)]">
            7 Days to Perfection
          </h2>
        </div>

        {/* Steps Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-cream rounded-[20px] p-8"
            >
              {/* Step Number */}
              <span className="font-display font-bold text-deep-brown/30 text-[4rem] leading-none block">
                {step.number}
              </span>

              {/* Divider */}
              <div className="w-10 h-0.5 bg-deep-brown/40 my-4" />

              {/* Days */}
              <span className="font-display font-semibold text-deep-brown text-[1.25rem] block mb-1">
                {step.days}
              </span>

              {/* Title */}
              <h3 className="font-display font-semibold text-deep-brown text-lg mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="font-body text-earth text-[15px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
