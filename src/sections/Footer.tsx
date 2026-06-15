export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    shop: [
      { label: 'Unpasteurized Ginger Fizz', href: '/product/unpasteurized' },
      { label: 'Wholesale', href: '/wholesale' },
    ],
    company: [
      { label: 'Our Story', href: '/#story' },
      { label: 'Process', href: '/#process' },
      { label: 'Benefits', href: '/#benefits' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Track Your Order', href: '/track' },
      { label: 'Contact Us', href: 'mailto:hello@gingerbrosshop.com' },
    ],
  };

  const socials = [
    { label: 'Instagram', href: 'https://www.instagram.com/drinkgingerbros' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@gingerbrosbrew' },
    { label: 'Line', href: 'https://line.me/R/ti/p/@gingerbros' },
    { label: 'Shopee', href: 'https://shopee.co.th/gingerbros' },
  ];

  return (
    <footer id="footer" className="bg-deep-brown text-cream py-16 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display font-bold text-[1.5rem] mb-4">GingerBros</h3>
            <p className="font-body text-[14px] text-cream/70 leading-relaxed mb-6">
              Naturally brewed craft ginger fizz from Thailand. 7-day fermentation, real ginger, zero shortcuts.
            </p>
            <div className="flex gap-4">
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
            <h4 className="font-body font-semibold text-[13px] uppercase tracking-[0.08em] mb-4 text-amber">Shop</h4>
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
            <h4 className="font-body font-semibold text-[13px] uppercase tracking-[0.08em] mb-4 text-amber">Company</h4>
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
            <h4 className="font-body font-semibold text-[13px] uppercase tracking-[0.08em] mb-4 text-amber">Support</h4>
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
            © {currentYear} GingerBros. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="font-body text-[13px] text-cream/50 hover:text-amber transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="font-body text-[13px] text-cream/50 hover:text-amber transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
