import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ShieldCheck, Sprout, BatteryCharging, HeartPulse, Flame, Droplets, Microscope, Sparkles } from 'lucide-react';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Prebiotic Power',
    description: 'Acacia tree fibre — one of the most well-researched prebiotic sources — feeds your gut bacteria and keeps your microbiome thriving.',
  },
  {
    icon: Sprout,
    title: 'Clean Ingredients',
    description: 'Fresh Thai ginger, filtered water, erythritol, white sugar for fermentation, ginger bug culture, acacia fibre, fresh lime. Nothing else.',
  },
  {
    icon: BatteryCharging,
    title: 'Steady Energy',
    description: 'No caffeine, no sugar spike, no 3pm crash. Prebiotic fibre feeds gut bacteria that regulate energy better than any energy drink.',
  },
  {
    icon: HeartPulse,
    title: 'Soothes & Settles',
    description: 'Ginger has been used for gut health across Asia for thousands of years. Ours is fresh, fermented, and strong enough to feel working.',
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber/20 rounded-full mb-5">
                  <Icon className="text-deep-brown w-8 h-8" strokeWidth={2} />
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

        {/* WHY PREBIOTICS deep-dive */}
        <div id="prebiotics" className="mt-16 bg-cream rounded-[24px] px-6 py-10 md:px-12 md:py-12 scroll-mt-24">
          <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
            WHY PREBIOTICS
          </span>
          <h3 className="font-display font-semibold text-deep-brown text-[clamp(1.25rem,2.5vw,1.75rem)] mb-3">
            Feed the bacteria. Everything else follows.
          </h3>
          <p className="font-body text-earth text-[15px] leading-relaxed mb-8 max-w-[600px]">
            Probiotics add new bacteria. Prebiotics feed the ones already doing the work. We use acacia tree fibre for its slow, gentle fermentation — converting sugars into energy your body can actually use.
          </p>

          {/* Core benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { stat: 'Digestion', detail: 'Acacia fibre slows glucose absorption and smooths digestion, cutting bloating and irregular patterns.' },
              { stat: 'Immunity', detail: 'Over 70% of immune cells live in the gut. A well-fed microbiome means a better-armed immune system.' },
              { stat: 'Energy', detail: 'Short-chain fatty acids from prebiotic fermentation fuel your gut lining and support steady, caffeine-free energy.' },
              { stat: 'Mood', detail: 'The gut-brain axis is real. Your microbiome produces neurotransmitters that directly affect how you feel.' },
            ].map((item) => (
              <div key={item.stat} className="bg-warm-white rounded-2xl p-5">
                <p className="font-display font-bold text-rust text-[15px] mb-1.5">{item.stat}</p>
                <p className="font-body text-earth text-[13px] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* Extra prebiotic detail */}
          <div className="bg-warm-white rounded-2xl p-6 md:p-8">
            <h4 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-4">Why Acacia Fibre?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: 'Slow Fermentation', desc: 'Unlike aggressive prebiotics that cause gas and bloating, acacia ferments slowly throughout the entire colon.' },
                { title: 'Clinically Studied', desc: 'Randomised trials show acacia fibre increases Bifidobacteria and Lactobacilli — the good guys — within 4 weeks.' },
                { title: 'Gentle on Everyone', desc: 'Low FODMAP certified. Works for sensitive stomachs, IBS sufferers, and people new to fibre supplements.' },
              ].map((item) => (
                <div key={item.title}>
                  <p className="font-body font-semibold text-deep-brown text-[14px] mb-1.5">{item.title}</p>
                  <p className="font-body text-earth text-[13px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WHY GINGER deep-dive */}
        <div id="ginger" className="mt-8 bg-warm-white border-2 border-cream rounded-[24px] px-6 py-10 md:px-12 md:py-12 scroll-mt-24">
          <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
            WHY GINGER
          </span>
          <h3 className="font-display font-semibold text-deep-brown text-[clamp(1.25rem,2.5vw,1.75rem)] mb-3">
            The root that does the work.
          </h3>
          <p className="font-body text-earth text-[15px] leading-relaxed mb-8 max-w-[600px]">
            Ginger is not a trend. It is a root that has been used medicinally for over 2,500 years, backed by modern research for digestion, inflammation, and immune support. We use fresh Thai ginger — not powder, not extract — fermented slowly so the active compounds stay intact.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { 
                icon: Flame, 
                stat: 'Digestive Relief', 
                detail: 'Gingerol and shogaol — the active compounds in ginger — stimulate gastric emptying and reduce bloating. Studies show ginger can speed stomach emptying by up to 50% (Wu et al., World J Gastroenterol).' 
              },
              { 
                icon: Droplets, 
                stat: 'Anti-Inflammatory', 
                detail: 'Ginger inhibits COX-2 and reduces pro-inflammatory cytokines. Clinical trials show it is as effective as ibuprofen for menstrual pain and osteoarthritis discomfort (Black et al., Arthritis Rheum).' 
              },
              { 
                icon: Microscope, 
                stat: 'Immune Support', 
                detail: 'Fresh ginger has antiviral and antibacterial properties. Research from the University of Minnesota found ginger extract inhibits respiratory pathogens and stimulates macrophage activity.' 
              },
              { 
                icon: Sparkles, 
                stat: 'Nausea & Motion Sickness', 
                detail: 'Ginger is one of the most studied natural anti-nausea remedies. Multiple RCTs confirm it reduces post-operative and chemotherapy-induced nausea without the drowsiness of conventional drugs (Marx et al., Integr Med Insights).' 
              },
            ].map((item) => (
              <div key={item.stat} className="bg-cream rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-5 h-5 text-rust" />
                  <p className="font-display font-bold text-rust text-[15px]">{item.stat}</p>
                </div>
                <p className="font-body text-earth text-[13px] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
