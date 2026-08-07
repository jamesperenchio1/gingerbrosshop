import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { GutHealthIcon, LeafIcon, LightningIcon, FlameIcon } from '@/components/Icons';

const BENEFITS = [
  {
    icon: GutHealthIcon,
    title: 'Prebiotic Power',
    description: 'We add acacia tree fibre, one of the most well-researched prebiotic sources available, to actively (and gently) feed your gut bacteria and keep your microbiome thriving.',
  },
  {
    icon: LeafIcon,
    title: 'Clean Ingredients',
    description: 'Fresh ginger, water, sugar, acacia fibre. That is it. No numbers on the label you need to Google. Nothing added to extend shelf life or make the colour pop.',
  },
  {
    icon: LightningIcon,
    title: 'Steady Energy',
    description: 'No caffeine, no sugar spike, no 3pm crash. The prebiotic fibre feeds your gut bacteria, and a healthy gut regulates energy better than any energy drink.',
  },
  {
    icon: FlameIcon,
    title: 'Soothes & Settles',
    description: 'Ginger has been used for gut complaints for thousands of years across Asia. Ours is fresh, fermented, and actually strong enough to feel it working.',
  },
];

// Quick, scannable facts that reinforce the "why" without a wall of text.
const FACTS = [
  { stat: '<2g', label: 'sugar per serve' },
  { stat: '5 days', label: 'naturally fermented' },
  { stat: 'Prebiotic', label: 'acacia fibre' },
  { stat: '330ml', label: 'real ginger fizz' },
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
        immediateRender: false,
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
          immediateRender: false,
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
      className="bg-warm-white py-[60px] md:py-[80px]"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-10 md:mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            WHY GINGER FIZZ
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            More Than a Drink
          </h2>
          <p className="font-body text-earth max-w-[560px] mx-auto">
            Thailand grows and exports a huge amount of ginger, ranking among the top producers in the world, but the country barely shows up on the list of places that actually consume it. Thailand's ginger industry is built mainly around exporting, not local use. It has been part of Thai food and medicine for centuries, but most of what is grown now leaves the country and gets turned into products elsewhere, often without much of that value returning to the farmers who grew it.

That is the deeper issue here. The people producing a resource are often not the ones who profit most from it. This is a pattern seen across many raw materials worldwide, not just ginger. Growing something and actually benefiting from it are frequently two very different things. Just something to think about while you drink the fizz....
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

        {/* WHY prebiotics deep-dive */}
        <div className="mt-16 bg-cream rounded-[24px] px-6 py-10 md:px-12 md:py-12">
          <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
            WHY PREBIOTICS
          </span>
          <h3 className="font-display font-semibold text-deep-brown text-[clamp(1.25rem,2.5vw,1.75rem)] mb-3">
            Feed the bacteria. Everything else follows.
          </h3>
          <p className="font-body text-earth text-[15px] leading-relaxed mb-8 max-w-[600px]">
            Probiotics add new bacteria. Prebiotics feed the ones already doing the work right now. No new ones. We use acacia tree fibre for its slow and gentle fermentation, a process in which it converts sugars into into energy your body can use.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { stat: 'Digestion', detail: 'Acacia fibre slows glucose absorption and smooths digestion, cutting bloating and irregular bowel patterns.' },
              { stat: 'Immunity', detail: 'Over 70% of your immune cells live in the gut. A well-fed microbiome means a better-armed immune system.' },
              { stat: 'Energy', detail: 'Short-chain fatty acids produced by prebiotic fermentation fuel your gut lining and support steady, caffeine-free energy.' },
              { stat: 'Mood', detail: 'The gut-brain axis is real. Your microbiome produces neurotransmitters, and keeping it healthy directly affects how you feel.' },
            ].map((item) => (
              <div key={item.stat} className="bg-warm-white rounded-2xl p-5">
                <p className="font-display font-bold text-rust text-[15px] mb-1.5">{item.stat}</p>
                <p className="font-body text-earth text-[13px] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
