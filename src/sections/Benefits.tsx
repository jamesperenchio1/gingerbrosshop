import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { GutHealthIcon, LeafIcon, LightningIcon, FlameIcon } from '@/components/Icons';
import { useI18n } from '@/context/I18nContext';

export default function Benefits() {
  const { t } = useI18n();

  const benefits = [
    { icon: GutHealthIcon, titleKey: 'benefit1Title', descKey: 'benefit1Desc' },
    { icon: LeafIcon,      titleKey: 'benefit2Title', descKey: 'benefit2Desc' },
    { icon: LightningIcon, titleKey: 'benefit3Title', descKey: 'benefit3Desc' },
    { icon: FlameIcon,     titleKey: 'benefit4Title', descKey: 'benefit4Desc' },
  ];

  const facts = [
    { statKey: 'factStat1', labelKey: 'factLabel1' },
    { statKey: 'factStat2', labelKey: 'factLabel2' },
    { statKey: 'factStat3', labelKey: 'factLabel3' },
    { statKey: 'factStat4', labelKey: 'factLabel4' },
  ];

  const prebioticItems = [
    { statKey: 'prebioticDigestion', detailKey: 'prebioticDigestionDetail' },
    { statKey: 'prebioticImmunity',  detailKey: 'prebioticImmunityDetail' },
    { statKey: 'prebioticEnergy',    detailKey: 'prebioticEnergyDetail' },
    { statKey: 'prebioticMood',      detailKey: 'prebioticMoodDetail' },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0, y: 30, duration: 0.6, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.from(Array.from(cards), {
          opacity: 0, y: 40, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="benefits" ref={sectionRef} className="bg-warm-white py-[60px] md:py-[80px]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div ref={headerRef} className="text-center mb-10 md:mb-16">
          <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
            {t('benefitsLabel')}
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            {t('benefitsSectionTitle')}
          </h2>
          <p className="font-body text-earth max-w-[560px] mx-auto whitespace-pre-line">
            {t('benefitsSectionSub')}
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.titleKey} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cream rounded-full mb-5">
                  <Icon className="text-rust" />
                </div>
                <h3 className="font-display font-semibold text-deep-brown text-[1.125rem] mb-3">
                  {t(benefit.titleKey)}
                </h3>
                <p className="font-body text-earth leading-relaxed">
                  {t(benefit.descKey)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {facts.map((fact) => (
            <div key={fact.labelKey} className="bg-cream rounded-2xl px-4 py-6 text-center">
              <p className="font-display font-bold text-deep-brown text-2xl sm:text-3xl leading-none mb-1.5">
                {t(fact.statKey)}
              </p>
              <p className="font-body text-earth text-[13px] leading-snug">{t(fact.labelKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-cream rounded-[24px] px-6 py-10 md:px-12 md:py-12">
          <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
            {t('prebioticsLabel')}
          </span>
          <h3 className="font-display font-semibold text-deep-brown text-[clamp(1.25rem,2.5vw,1.75rem)] mb-3">
            {t('prebioticsTitle')}
          </h3>
          <p className="font-body text-earth text-[15px] leading-relaxed mb-8 max-w-[600px]">
            {t('prebioticsDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prebioticItems.map((item) => (
              <div key={item.statKey} className="bg-warm-white rounded-2xl p-5">
                <p className="font-display font-bold text-rust text-[15px] mb-1.5">{t(item.statKey)}</p>
                <p className="font-body text-earth text-[13px] leading-relaxed">{t(item.detailKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
