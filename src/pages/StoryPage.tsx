import { Link } from 'react-router';
import SEO from '@/components/SEO';
import ResponsiveImage from '@/components/ResponsiveImage';
import { useI18n } from '@/context/I18nContext';
import { SITE_URL } from '@/constants/site';

export default function StoryPage() {
  const { t, locale } = useI18n();
  const pillars = [1, 2, 3].map((n) => ({ title: t(`pillar${n}Title`), desc: t(`pillar${n}Desc`) }));
  return (
    <>
      <SEO
        title={locale === 'th' ? 'เรื่องราวของเรา | GingerBros' : 'Our Story: Rooted in Ginger, Made for Today | GingerBros'}
        description="Why GingerBros exists: to make Thai ginger the drink you actually want to reach for. Fresh Thai ginger, real lime, low sugar, made in Thailand."
        path="/story"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'Our Story',
          url: `${SITE_URL}/story`,
          about: { '@type': 'Organization', name: 'GingerBros', url: SITE_URL },
        }}
      />
      <section className="bg-charcoal pb-16 pt-32 text-cream md:pb-24 md:pt-40">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <span className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-ginger">{t('storyLabel')}</span>
          <h1 className="font-poster mt-4 max-w-[14ch] text-[clamp(3rem,10vw,8rem)]">{t('storyTitle')}</h1>
        </div>
      </section>

      <section className="bg-warm-white py-16 md:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-4 sm:px-6 md:grid-cols-[1fr_1fr] md:items-start">
          <div className="space-y-6 font-body text-[18px] leading-relaxed text-earth">
            <p className="font-display text-[1.6rem] font-semibold leading-snug text-deep-brown">{t('storyPara1')}</p>
            <p>{t('storyPara2')}</p>
            <p>{t('storyPara3')}</p>
            <Link to="/shop" className="inline-block rounded-full bg-charcoal px-8 py-4 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-cream hover:bg-deep-brown">
              {t('storyCtaProcess')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ResponsiveImage name="life-stoop" alt="Two friends sharing GingerBros on a Bangkok stoop" sizes="(min-width: 768px) 280px, 50vw" className="aspect-[4/5] w-full rounded-[24px] object-cover" />
            <ResponsiveImage name="life-ice-stool" alt="GingerBros bottle and an iced glass on a yellow plastic stool" sizes="(min-width: 768px) 280px, 50vw" className="mt-12 aspect-[4/5] w-full rounded-[24px] object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-ginger py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <h2 className="font-poster text-[clamp(2.4rem,6vw,4.5rem)] text-charcoal">{t('manifestoTitle')}</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => (
              <li key={p.title} className="rounded-[24px] bg-warm-white p-7">
                <span className="font-poster text-[2.6rem] text-rust">0{i + 1}</span>
                <h3 className="mt-2 font-display text-[1.3rem] font-bold text-deep-brown">{p.title}</h3>
                <p className="mt-2 font-body text-[15px] text-earth">{p.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
