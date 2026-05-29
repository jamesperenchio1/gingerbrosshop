import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

      const children = contentRef.current?.children;
      if (children) {
        gsap.to(Array.from(children), {
          opacity: 1,
          y: 0,
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
      className="py-[120px] md:py-[80px] max-md:py-[60px] relative"
      style={{ background: 'linear-gradient(to bottom, rgba(240,212,168,0.3) 0%, #FDF8F0 100%)' }}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-12 md:gap-16 items-center">
          {/* Left — Image */}
          <div
            ref={imageRef}
            className="opacity-0 translate-x-[-40px] scale-[1.02] order-2 md:order-1"
          >
            <div className="rounded-[20px] overflow-hidden shadow-lg md:-mt-5">
              <img
                src="/images/story-brewing.png"
                alt="Craft brewing process with wooden barrels and ginger"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </div>
          </div>

          {/* Right — Content */}
          <div ref={contentRef} className="order-1 md:order-2">
            <span className="opacity-0 translate-y-[30px] block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
              OUR STORY
            </span>
            <h2 className="opacity-0 translate-y-[30px] font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-6">
              Brewed with Patience, Served with Pride
            </h2>
            <p className="opacity-0 translate-y-[30px] font-body text-earth leading-relaxed mb-4">
              GingerBros started with a simple belief: the best things take time. Every batch of our ginger beer undergoes a full 7-day natural fermentation process using only four ingredients — ginger, water, sugar, and live cultures.
            </p>
            <p className="opacity-0 translate-y-[30px] font-body text-earth leading-relaxed mb-8">
              What begins as a humble blend transforms through patience into a crisp, refreshing drink that&apos;s naturally high in vitamin B and ginger-derived prebiotic compounds. Good for the gut, great for the soul.
            </p>

            {/* 7 Days Stamp */}
            <div className="opacity-0 translate-y-[30px] mb-8">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-[2.5px] border-rust bg-cream/50">
                <div className="text-center">
                  <span className="block font-display font-bold text-rust text-3xl leading-none">7</span>
                  <span className="block font-body font-bold text-rust text-[9px] uppercase tracking-[0.15em] leading-tight mt-0.5">
                    Days Ferment
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcessClick}
              className="opacity-0 translate-y-[30px] inline-block bg-transparent text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-9 py-3.5 rounded-full border-2 border-deep-brown hover:bg-deep-brown hover:text-cream active:scale-[0.98] transition-all duration-200"
            >
              Learn Our Process
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
