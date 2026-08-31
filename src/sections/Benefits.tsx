import { useRef } from 'react';
import { ShieldCheck, Sprout, BatteryCharging, HeartPulse, Flame, Droplets, Microscope, Sparkles } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useReveal } from '@/lib/reveal';

export default function Benefits() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useReveal(sectionRef, (reveal) => {
    reveal(headerRef.current, { y: 30, duration: 0.6, trigger: sectionRef.current, start: 'top 80%' });
    reveal(cardsRef.current?.children, {
      duration: 0.7,
      stagger: 0.12,
      trigger: cardsRef.current,
      start: 'top 80%',
    });
  });

  const benefits = [
    { icon: ShieldCheck, title: t('benefit1Title'), description: t('benefit1Desc') },
    { icon: Sprout, title: t('benefit2Title'), description: t('benefit2Desc') },
    { icon: BatteryCharging, title: t('benefit3Title'), description: t('benefit3Desc') },
    { icon: HeartPulse, title: t('benefit4Title'), description: t('benefit4Desc') },
  ];

  const facts = [
    { stat: t('factStat1'), label: t('factLabel1') },
    { stat: t('factStat2'), label: t('factLabel2') },
    { stat: t('factStat3'), label: t('factLabel3') },
    { stat: t('factStat4'), label: t('factLabel4') },
  ];

  const prebioticCards = [
    { stat: t('prebioticDigestion'), detail: t('prebioticDigestionDetail') },
    { stat: t('prebioticImmunity'), detail: t('prebioticImmunityDetail') },
    { stat: t('prebioticEnergy'), detail: t('prebioticEnergyDetail') },
    { stat: t('prebioticMood'), detail: t('prebioticMoodDetail') },
  ];

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
            {t('benefitsLabel')}
          </span>
          <h2 className="font-display font-semibold text-deep-brown text-[clamp(1.5rem,3vw,2.5rem)] mb-3">
            {t('benefitsSectionTitle')}
          </h2>
        </div>

        {/* Benefits Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => {
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
          {facts.map((fact) => (
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
        <div id="prebiotics" className="mt-16 bg-cream rounded-3xl px-6 py-10 md:px-12 md:py-12 scroll-mt-24">
          <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
            {t('prebioticsLabel')}
          </span>
          <h3 className="font-display font-semibold text-deep-brown text-[clamp(1.25rem,2.5vw,1.75rem)] mb-3">
            {t('prebioticsTitle')}
          </h3>
          <p className="font-body text-earth text-[15px] leading-relaxed mb-8 max-w-[600px]">
            {t('prebioticsDesc')}
          </p>

          {/* Core benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {prebioticCards.map((item) => (
              <div key={item.stat} className="bg-warm-white rounded-2xl p-5">
                <p className="font-display font-bold text-rust text-[15px] mb-1.5">{item.stat}</p>
                <p className="font-body text-earth text-[13px] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* Extra prebiotic detail */}
          <div className="bg-warm-white rounded-2xl p-6 md:p-8">
            <h4 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-4">{t('whyAcaciaTitle')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: t('acaciaFermentTitle'), desc: t('acaciaFermentDesc') },
                { title: t('acaciaStudiedTitle'), desc: t('acaciaStudiedDesc') },
                { title: t('acaciaGentleTitle'), desc: t('acaciaGentleDesc') },
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
        <div id="ginger" className="mt-8 bg-warm-white border-2 border-cream rounded-3xl px-6 py-10 md:px-12 md:py-12 scroll-mt-24">
          <span className="block font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3">
            {t('whyGingerLabel')}
          </span>
          <h3 className="font-display font-semibold text-deep-brown text-[clamp(1.25rem,2.5vw,1.75rem)] mb-3">
            {t('whyGingerTitle')}
          </h3>
          <p className="font-body text-earth text-[15px] leading-relaxed mb-8 max-w-[600px]">
            {t('whyGingerDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cream rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-rust" />
                <p className="font-display font-bold text-rust text-[15px]">{t('gingerDigestiveTitle')}</p>
              </div>
              <p className="font-body text-earth text-[13px] leading-relaxed">
                {t('gingerDigestiveDesc')} (<a href="https://pubmed.ncbi.nlm.nih.gov/18442245/" target="_blank" rel="noopener noreferrer" className="text-rust underline hover:text-deep-brown">Wu et al., World J Gastroenterol</a>).
              </p>
            </div>
            <div className="bg-cream rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-rust" />
                <p className="font-display font-bold text-rust text-[15px]">{t('gingerInflammationTitle')}</p>
              </div>
              <p className="font-body text-earth text-[13px] leading-relaxed">
                {t('gingerInflammationDesc')} (<a href="https://pubmed.ncbi.nlm.nih.gov/20418184/" target="_blank" rel="noopener noreferrer" className="text-rust underline hover:text-deep-brown">Black et al., Arthritis Rheum</a>).
              </p>
            </div>
            <div className="bg-cream rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Microscope className="w-5 h-5 text-rust" />
                <p className="font-display font-bold text-rust text-[15px]">{t('gingerImmuneTitle')}</p>
              </div>
              <p className="font-body text-earth text-[13px] leading-relaxed">
                {t('gingerImmuneDesc')} (<a href="https://pubmed.ncbi.nlm.nih.gov/23123794/" target="_blank" rel="noopener noreferrer" className="text-rust underline hover:text-deep-brown">PubMed</a>).
              </p>
            </div>
            <div className="bg-cream rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-rust" />
                <p className="font-display font-bold text-rust text-[15px]">{t('gingerNauseaTitle')}</p>
              </div>
              <p className="font-body text-earth text-[13px] leading-relaxed">
                {t('gingerNauseaDesc')} (<a href="https://pubmed.ncbi.nlm.nih.gov/27094916/" target="_blank" rel="noopener noreferrer" className="text-rust underline hover:text-deep-brown">Marx et al., Integr Med Insights</a>).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
