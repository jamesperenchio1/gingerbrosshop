import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import ResponsiveImage from '@/components/ResponsiveImage';
import { manifestNameForUrl } from '@/lib/image';
import { FEATURED_GUIDE_SLUGS, guidesFor } from '@/lib/guideIndex';

/**
 * Homepage module pointing at the best guide articles.
 *
 * Before this, the homepage linked to zero guides and every article was only
 * reachable from /guide — which is why Search Console sat on ~21 "Discovered,
 * currently not indexed" URLs.
 */
export default function HomeGuides() {
  const { t } = useI18n();
  const guides = guidesFor(FEATURED_GUIDE_SLUGS);

  return (
    <section aria-labelledby="guides-title" className="bg-warm-white py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-body text-[12px] font-bold uppercase tracking-[0.16em] text-rust">{t('guidesLabel')}</span>
            <h2 id="guides-title" className="font-poster mt-3 text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.95] text-charcoal">
              {t('guidesTitle')}
            </h2>
            <p className="mt-4 max-w-[520px] font-body text-[16px] leading-relaxed text-earth">{t('guidesSub')}</p>
          </div>
          <Link
            to="/guide"
            className="rounded-full border border-charcoal/20 px-6 py-3 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-cream"
          >
            {t('guidesCta')} →
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link to={`/guide/${guide.slug}`} className="group block overflow-hidden rounded-[24px] bg-cream shadow-card">
                <ResponsiveImage
                  name={manifestNameForUrl(guide.image)}
                  src={guide.image}
                  alt={guide.title}
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="p-6">
                  <h3 className="font-display text-[19px] font-bold leading-snug text-deep-brown">{guide.title}</h3>
                  <p className="mt-2 line-clamp-3 font-body text-[14px] leading-relaxed text-earth">{guide.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-body text-[13px] font-semibold text-rust">
                    {t('guidesRead')} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
