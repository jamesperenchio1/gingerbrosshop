import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import ResponsiveImage from '@/components/ResponsiveImage';

const TILES = [
  { n: 1, image: 'life-pour-cold', alt: 'A tall glass of ginger drink over ice next to a GingerBros bottle' },
  { n: 2, image: 'life-limes-overhead', alt: 'Ginger Fizz bottles on ice with fresh limes and ginger' },
  { n: 3, image: 'life-ice-stool', alt: 'GingerBros bottle and an iced glass on a yellow plastic stool' },
  { n: 4, image: 'life-cheers', alt: 'Two friends clinking GingerBros bottles against a pink wall' },
];

export default function GingerWay() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="way-title" className="bg-charcoal py-16 text-cream md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-ginger">{t('wayLabel')}</span>
            <h2 id="way-title" className="font-poster mt-3 text-[clamp(2.6rem,6.5vw,5rem)]">{t('wayTitle')}</h2>
          </div>
          <Link to="/guide" className="rounded-full bg-ginger px-6 py-3 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-amber">
            {t('wayCta')} →
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map(({ n, image, alt }) => (
            <li key={n} className="group relative overflow-hidden rounded-[24px]">
              <ResponsiveImage
                name={image}
                alt={alt}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-poster text-[2rem] text-cream">{t(`way${n}Title`)}</h3>
                <p className="mt-1 font-body text-[14px] leading-snug text-cream/90">{t(`way${n}Desc`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
