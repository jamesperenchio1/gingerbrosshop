import { Link } from 'react-router';
import { useI18n } from '@/context/I18nContext';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { t } = useI18n();

  const columns = [
    {
      title: t('shop'),
      links: [
        { label: 'Ginger Fizz', to: '/product/ginger-fizz' },
        { label: 'Ginger Tea', to: '/product/ginger-tea' },
        { label: 'Fizz & Tea Duo', to: '/product/fizz-tea-duo' },
        { label: '6-Packs', to: '/product/ginger-fizz-6pack' },
        { label: t('shopTabEquipment'), to: '/shop' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('ourStory'), to: '/story' },
        { label: t('guide'), to: '/guide' },
        { label: t('business'), to: '/business' },
        { label: t('findUs'), to: '/find-us' },
      ],
    },
    {
      title: t('support'),
      links: [
        { label: t('shipping'), to: '/shipping' },
        { label: t('faq'), to: '/faq' },
        { label: t('returns'), to: '/returns' },
        { label: t('myOrders'), to: '/orders' },
        { label: t('trackOrder'), to: '/track' },
      ],
    },
  ];

  const socials = [
    { label: 'Instagram', href: 'https://www.instagram.com/drinkgingerbros' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@gingerbrosbrew' },
    { label: 'LINE', href: 'https://line.me/R/ti/p/@852nqred' },
    { label: 'Shopee', href: 'https://shopee.co.th/gingerbros' },
  ];

  return (
    <footer id="footer" className="overflow-hidden bg-charcoal text-cream">
      <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-16 sm:px-6 md:pt-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <p className="font-poster text-[2.2rem] normal-case">GingerBros<span className="text-ginger">.</span></p>
            <p className="mt-4 max-w-[340px] font-body text-[14px] leading-relaxed text-cream/85">{t('footerBrandBlurb')}</p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-cream/90 hover:text-ginger">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href="mailto:gingerbros.brew@gmail.com" className="mt-4 inline-block font-body text-[14px] text-cream/90 underline underline-offset-4 hover:text-ginger">
              gingerbros.brew@gmail.com
            </a>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-ginger">{col.title}</h2>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="font-body text-[14px] text-cream/85 hover:text-ginger">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Decorative: drawn with CSS content so it isn't text (screen readers, contrast checks). */}
        <div aria-hidden="true" className="font-poster mt-16 select-none whitespace-nowrap text-[clamp(3rem,13vw,11rem)] text-cream/[0.08] before:content-['Think\_ginger.']" />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-6 md:flex-row">
          <p className="font-body text-[13px] text-cream/75" suppressHydrationWarning>
            © {CURRENT_YEAR} GingerBros. {t('footerCopyright')}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="font-body text-[13px] text-cream/75 hover:text-ginger">{t('privacy')}</Link>
            <Link to="/terms" className="font-body text-[13px] text-cream/75 hover:text-ginger">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
