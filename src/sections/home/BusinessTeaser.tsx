import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import ResponsiveImage from '@/components/ResponsiveImage';

export default function BusinessTeaser() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="biz-title" className="bg-warm-white py-16 md:py-24">
      <div className="mx-auto grid max-w-[1180px] items-center gap-8 overflow-hidden rounded-[32px] bg-ginger px-6 py-10 sm:px-10 md:grid-cols-[1.2fr_1fr] md:py-14">
        <div>
          <span className="font-body text-[12px] font-bold uppercase tracking-[0.16em] text-deep-brown">{t('businessLabel')}</span>
          <h2 id="biz-title" className="font-poster mt-3 text-[clamp(2.4rem,6vw,4.5rem)] text-charcoal">{t('businessTitle')}</h2>
          <p className="mt-5 max-w-[520px] font-body text-[16px] leading-relaxed text-charcoal">{t('businessSub')}</p>
          <Link to="/business" className="mt-7 inline-block rounded-full bg-charcoal px-7 py-3.5 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-cream hover:bg-deep-brown">
            {t('businessCta')} →
          </Link>
        </div>
        <ResponsiveImage
          name="life-pair-kra-pao"
          alt="GingerBros Ginger Fizz served with pad kra pao"
          sizes="(min-width: 768px) 440px, 100vw"
          className="w-full rotate-[-2deg] rounded-[24px] shadow-card"
        />
      </div>
    </section>
  );
}
