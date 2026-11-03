import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';
import { HOME_FAQ } from '@/lib/homeContent';

export default function HomeFaq() {
  const { locale } = useI18n();
  const items = HOME_FAQ[locale];
  return (
    <section aria-labelledby="home-faq-title" className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-[820px] px-4 sm:px-6">
        <h2 id="home-faq-title" className="font-poster text-[clamp(2.4rem,6vw,4.2rem)] text-deep-brown">
          {locale === 'th' ? 'คำถามที่พบบ่อย' : 'Good questions.'}
        </h2>
        <div className="mt-8 divide-y divide-charcoal/10 rounded-[24px] bg-warm-white">
          {items.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[1.05rem] font-semibold text-deep-brown">
                {item.q}
                <span aria-hidden="true" className="text-rust transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 font-body text-[15px] leading-relaxed text-earth">{item.a}</p>
            </details>
          ))}
        </div>
        <Link to="/faq" className="mt-6 inline-block font-body text-[14px] font-semibold text-rust hover:text-deep-brown">
          {locale === 'th' ? 'ดูคำถามทั้งหมด' : 'See all FAQs'} →
        </Link>
      </div>
    </section>
  );
}
