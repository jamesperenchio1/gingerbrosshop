import { useI18n } from '@/context/I18nContext';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { t } = useI18n();

  const links = {
    shop: [
      { label: 'GingerBros Ginger Fizz', href: '/product/ginger-fizz' },
      { label: t('wholesale'), href: '/wholesale' },
    ],
    company: [
      { label: t('ourStory'), href: '/#story' },
      { label: t('process'), href: '/#process' },
      { label: t('benefits'), href: '/#benefits' },
      { label: t('blog'), href: '/blog' },
    ],
    support: [
      { label: t('shipping'), href: '/shipping' },
      { label: t('faq'), href: '/faq' },
      { label: t('myOrders'), href: '/orders' },
      { label: t('trackOrder'), href: '/track' },
      { label: t('contact'), href: 'mailto:gingerbros.brew@gmail.com' },
    ],
  };

  const socials = [
    { label: 'Instagram', href: 'https://www.instagram.com/drinkgingerbros' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@gingerbrosbrew' },
    { label: 'Line', href: 'https://line.me/R/ti/p/@852nqred' },
    { label: 'Shopee', href: 'https://shopee.co.th/gingerbros' },
  ];

  return (
    <footer id="footer" className="bg-deep-brown text-cream py-16 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display font-bold text-[1.5rem] mb-4">GingerBros</h3>
            <p className="font-body text-[14px] text-cream/70 leading-relaxed mb-6">
              Naturally brewed craft ginger fizz from Thailand. 7-day fermentation, real ginger, zero shortcuts.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[12px] uppercase tracking-[0.08em] text-cream/70 hover:text-amber transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body font-semibold text-[13px] uppercase tracking-[0.08em] mb-4 text-amber">{t('shop')}</h4>
            <ul className="space-y-2.5">
              {links.shop.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-[14px] text-cream/70 hover:text-amber transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body font-semibold text-[13px] uppercase tracking-[0.08em] mb-4 text-amber">{t('company')}</h4>
            <ul className="space-y-2.5">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-[14px] text-cream/70 hover:text-amber transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-body font-semibold text-[13px] uppercase tracking-[0.08em] mb-4 text-amber">{t('support')}</h4>
            <ul className="space-y-2.5">
              {links.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-[14px] text-cream/70 hover:text-amber transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-[13px] text-cream/50 text-center md:text-left">
            © {CURRENT_YEAR} GingerBros. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="font-body text-[13px] text-cream/50 hover:text-amber transition-colors">
              {t('privacy')}
            </a>
            <a href="/terms" className="font-body text-[13px] text-cream/50 hover:text-amber transition-colors">
              {t('terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
