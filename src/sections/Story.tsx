import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useI18n } from '@/context/I18nContext';

export default function Story() {
  const { t } = useI18n();
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
          immediateRender: false,
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
              {t('storyLabel')}
            </span>
            <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-6">
              {t('storyTitle')}
            </h2>

            <p className="font-body text-earth leading-relaxed mb-5">
              {t('storyPara1')}
            </p>

            <p className="font-body text-earth leading-relaxed mb-4">
              {t('storyPara2')}
            </p>

            <ul className="font-body text-earth text-[14px] leading-relaxed mb-6 space-y-2 pl-1">
              {(['storyBullet1', 'storyBullet2', 'storyBullet3', 'storyBullet4', 'storyBullet5', 'storyBullet6'] as const).map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-rust" />
                  {t(key)}
                </li>
              ))}
            </ul>

            <p className="font-body text-earth leading-relaxed mb-5">
              {t('storyPara3')}
            </p>

            <button
              onClick={handleProcessClick}
              className="inline-block bg-transparent text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-9 py-3.5 rounded-full border-2 border-deep-brown hover:bg-deep-brown hover:text-cream active:scale-[0.98] transition-all duration-200"
            >
              {t('storyCtaProcess')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
