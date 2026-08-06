import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const children = contentRef.current?.children;
      if (children) {
        gsap.from(Array.from(children), {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleProcessClick = () => {
    const el = document.querySelector('#process');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="story"
      ref={sectionRef}
      className="py-[60px] md:py-[80px] relative"
      style={{ background: 'linear-gradient(to bottom, rgba(240,212,168,0.3) 0%, #FDF8F0 100%)' }}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div>
          <div ref={contentRef}>
            <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
              OUR STORY
            </span>
            <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-6">
              Brewed with Patience, Served with Pride
            </h2>

            <p className="font-body text-earth leading-relaxed mb-5">
              GingerBros started with a simple question: why does everything sold as "healthy" taste like compromise? We wanted something that was genuinely good for you — not because it had vitamins added in a lab, but because the process itself created something nourishing. That search led us to fermentation.
            </p>

            <p className="font-body text-earth leading-relaxed mb-5">
              Every batch of our ginger fizz undergoes a full 7-day natural fermentation process. We keep the ingredient list short on purpose: fresh Thai ginger, water, cane sugar, and prebiotic acacia fibre. No concentrates, no artificial carbonation, no shortcuts. The slow ferment is where the magic happens — it's what gives each bottle its depth of flavour and its gentle, natural fizz.
            </p>

            <p className="font-body text-earth leading-relaxed mb-4">
              We source our acacia fibre specifically because it's one of the most well-studied prebiotic fibres in existence. Prebiotics aren't probiotics — they don't add new bacteria. Instead, they feed the good bacteria already living in your gut. When that ecosystem is well-fed, the effects ripple outward:
            </p>

            <ul className="font-body text-earth text-[14px] leading-relaxed mb-6 space-y-2 pl-1">
              {[
                'Better digestion and less bloating',
                'Stronger immunity — over 70% of immune cells live in the gut',
                'Steadier energy without caffeine spikes or crashes',
                'Improved mood — the gut and brain are in constant conversation',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-rust" />
                  {point}
                </li>
              ))}
            </ul>

            <p className="font-body text-earth leading-relaxed mb-8">
              We're based in Bangkok and source our ginger locally. Fresh rhizomes, short supply chain, no compromises on quality. That's it.
            </p>

            <button
              onClick={handleProcessClick}
              className="inline-block bg-transparent text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-9 py-3.5 rounded-full border-2 border-deep-brown hover:bg-deep-brown hover:text-cream active:scale-[0.98] transition-all duration-200"
            >
              Learn Our Process
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
