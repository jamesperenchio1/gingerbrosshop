import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import { COMPARE_COPY } from '@/lib/homeContent';

export default function Compare() {
  const { locale } = useI18n();
  const c = COMPARE_COPY[locale];
  const cards = [
    { ...c.fizz, to: '/product/ginger-fizz', tone: 'bg-ginger text-charcoal', tagTone: 'text-deep-brown', btn: 'bg-charcoal text-cream hover:bg-deep-brown' },
    { ...c.tea, to: '/product/ginger-tea', tone: 'bg-charcoal text-cream', tagTone: 'text-ginger', btn: 'bg-ginger text-charcoal hover:bg-amber' },
  ];
  return (
    <section aria-labelledby="compare-title" className="bg-warm-white py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <span className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-rust">{c.label}</span>
        <h2 id="compare-title" className="font-poster mt-3 text-[clamp(2.6rem,6.5vw,5rem)] text-deep-brown">{c.title}</h2>
        <p className="mt-4 max-w-[560px] font-body text-[17px] leading-relaxed text-earth">{c.sub}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <div key={card.name} className={`rounded-[28px] p-7 md:p-9 ${card.tone}`}>
              <h3 className="font-poster text-[clamp(1.8rem,3.5vw,2.6rem)]">{card.name}</h3>
              <p className={`mt-3 font-body text-[12px] font-bold uppercase tracking-[0.12em] ${card.tagTone}`}>{card.tag}</p>
              <p className="mt-4 font-body text-[16px] leading-relaxed opacity-90">{card.body}</p>
              <Link to={card.to} className={`mt-6 inline-block rounded-full px-6 py-3 font-body text-[13px] font-bold uppercase tracking-[0.1em] ${card.btn}`}>
                {card.cta} →
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-[640px] font-body text-[16px] leading-relaxed text-earth">{c.forWho}</p>
        <Link to="/product/fizz-tea-duo" className="mt-3 inline-block font-body text-[15px] font-semibold text-rust hover:text-deep-brown">{c.both}</Link>
      </div>
    </section>
  );
}
