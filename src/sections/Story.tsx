import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(imageRef.current, {
        opacity: 0,
        x: -40,
        scale: 1.02,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

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
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 md:gap-16 items-center">
          {/* Left — Image */}
          <div
            ref={imageRef}
            className="order-2 md:order-1 min-w-0"
          >
            <div className="rounded-[20px] overflow-hidden shadow-lg md:-mt-5">
              <img
                src="/images/story-brewing.webp"
                alt="Craft brewing process with wooden barrels and ginger"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </div>
          </div>

          {/* Right — Content */}
          <div ref={contentRef} className="order-1 md:order-2 min-w-0">
            <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
              OUR STORY
            </span>
            <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-6">
              Brewed with Patience, Served with Pride
            </h2>
            <p className="font-body text-earth leading-relaxed mb-4">
              GingerBros started with a simple belief: the best things take time. Every batch of our ginger fizz undergoes a full 7-day natural fermentation process using a handful of core ingredients: fresh ginger, water, sugar, and prebiotic acacia fibre — one of the most effective prebiotic sources on the planet.
            </p>
            <p className="font-body text-earth leading-relaxed mb-3">
              Prebiotics matter because they feed the good bacteria already living in your gut, not just add more. When your gut bacteria thrive, everything else follows:
            </p>
            <ul className="font-body text-earth text-[14px] leading-relaxed mb-8 space-y-1.5 pl-1">
              {[
                'Better digestion and less bloating',
                'Stronger immunity. Over 70% of immune cells live in the gut',
                'Steadier energy without caffeine spikes or crashes',
                'Improved mood. The gut and brain are in constant conversation',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-rust" />
                  {point}
                </li>
              ))}
            </ul>

            {/* 7 Days Stamp */}
            <div className="mb-8">
              <div className="inline-block -rotate-6 transition-transform hover:-rotate-3">
                <svg
                  viewBox="0 0 180 180"
                  className="w-[140px] h-[140px] drop-shadow-sm"
                  aria-label="7 days naturally fermented stamp"
                >
                  <defs>
                    <path id="topArc" d="M 26,90 A 64,64 0 0,1 154,90" />
                    <path id="bottomArc" d="M 26,90 A 64,64 0 0,0 154,90" />
                  </defs>
                  <circle
                    cx="90"
                    cy="90"
                    r="82"
                    fill="#FAF3E6"
                    stroke="#A65D2E"
                    strokeWidth="3"
                    strokeDasharray="7 5"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r="74"
                    fill="none"
                    stroke="#A65D2E"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  <text
                    className="font-body"
                    fontSize="12"
                    fontWeight="600"
                    fill="#A65D2E"
                    letterSpacing="2"
                  >
                    <textPath href="#topArc" startOffset="50%" textAnchor="middle">
                      NATURALLY FERMENTED
                    </textPath>
                  </text>
                  <text
                    x="90"
                    y="102"
                    textAnchor="middle"
                    className="font-display"
                    fontSize="56"
                    fontWeight="bold"
                    fill="#4A2C10"
                  >
                    7
                  </text>
                  <text
                    className="font-body"
                    fontSize="12"
                    fontWeight="600"
                    fill="#A65D2E"
                    letterSpacing="3"
                  >
                    <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
                      DAYS
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>

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
