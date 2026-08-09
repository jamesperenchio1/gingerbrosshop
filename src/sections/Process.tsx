import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useI18n } from '@/context/I18nContext';

export default function Process() {
  const { t } = useI18n();

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const steps = [
    { number: '01', daysKey: 'step01Days', titleKey: 'step01Title', descKey: 'step01Desc' },
    { number: '02', daysKey: 'step02Days', titleKey: 'step02Title', descKey: 'step02Desc' },
    { number: '03', daysKey: 'step03Days', titleKey: 'step03Title', descKey: 'step03Desc' },
    { number: '04', daysKey: 'step04Days', titleKey: 'step04Title', descKey: 'step04Desc' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([headerRef.current, cardsRef.current], {
        opacity: 0, duration: 0.5, ease: 'power2.out',
        immediateRender: false,
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="bg-amber py-[60px] md:py-[80px]">
      <div className="max-w-[1000px] mx-auto px-6">
        <div ref={headerRef} className="text-center mb-10 md:mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-cream mb-3 block">
            {t('processLabel')}
          </span>
          <h2 className="font-display font-semibold text-cream text-[clamp(1.5rem,3vw,2.5rem)]">
            {t('processSectionTitle')}
          </h2>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-cream rounded-[20px] p-5 sm:p-8">
              <span className="font-display font-bold text-deep-brown text-[4rem] leading-none block">
                {step.number}
              </span>
              <div className="w-10 h-0.5 bg-deep-brown/40 my-4" />
              <span className="font-display font-semibold text-deep-brown text-[1.25rem] block mb-1">
                {t(step.daysKey)}
              </span>
              <h3 className="font-display font-semibold text-deep-brown text-lg mb-3">
                {t(step.titleKey)}
              </h3>
              <p className="font-body text-earth text-[15px] leading-relaxed">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
