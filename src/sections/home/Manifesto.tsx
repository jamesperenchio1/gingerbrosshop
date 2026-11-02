import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import ResponsiveImage from '@/components/ResponsiveImage';

export default function Manifesto() {
  const { t } = useI18n();
  const pillars = [1, 2, 3].map((n) => ({ title: t(`pillar${n}Title`), desc: t(`pillar${n}Desc`) }));
  return (
    <section aria-labelledby="manifesto-title" className="bg-cream py-16 md:py-24">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16">
        <div>
          <span className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-rust">{t('manifestoLabel')}</span>
          <h2 id="manifesto-title" className="font-poster mt-3 text-[clamp(2.6rem,6.5vw,5rem)] text-deep-brown">{t('manifestoTitle')}</h2>
          <p className="mt-6 font-body text-[17px] leading-relaxed text-earth">{t('manifestoBody')}</p>
          <ul className="mt-8 space-y-5">
            {pillars.map((p, i) => (
              <li key={p.title} className="flex gap-4">
                <span aria-hidden="true" className="font-poster text-[2rem] leading-none text-rust">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-[1.15rem] font-bold text-deep-brown">{p.title}</h3>
                  <p className="font-body text-[15px] text-earth">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/story" className="mt-8 inline-block rounded-full border-2 border-deep-brown px-7 py-3 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-deep-brown transition-colors hover:bg-deep-brown hover:text-cream">
            {t('manifestoCta')} →
          </Link>
        </div>
        <div className="relative">
          <ResponsiveImage
            name="life-night-market"
            alt="A bottle of GingerBros Ginger Fizz on a night-market table with grilled skewers"
            sizes="(min-width: 768px) 560px, 100vw"
            className="w-full rotate-[1.5deg] rounded-[28px] shadow-card"
          />
          <span className="absolute -bottom-5 -left-3 rotate-[-4deg] rounded-full bg-charcoal px-5 py-2.5 font-poster text-[1.3rem] text-ginger shadow-card">
            Ginger has entered the chat.
          </span>
        </div>
      </div>
    </section>
  );
}
