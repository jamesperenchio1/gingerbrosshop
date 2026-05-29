import { InstagramIcon, FacebookIcon, TikTokIcon, LineIcon } from '@/components/Icons';

const shopLinks = [
  { label: 'Pasteurized', href: '/product/pasteurized' },
  { label: '6-Pack Bundle', href: '/product/pasteurized-6pack' },
  { label: 'Unpasteurized', href: '/product/unpasteurized' },
  { label: 'Shopee Store', href: 'https://shopee.co.th/gingerbros' },
];

const companyLinks = [
  { label: 'Our Story', href: '/#story' },
  { label: 'The Process', href: '/#process' },
];

const socials = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/gingerbrosbrew' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61573086524067' },
  { icon: TikTokIcon, label: 'TikTok', href: 'https://www.tiktok.com/@gingerbrosbrew' },
  { icon: LineIcon, label: 'Line', href: 'https://lin.ee/qRnVI6E' },
];

export default function Footer() {
  return (
    <footer className="bg-deep-brown text-cream pt-20 pb-10">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div>
            <span className="font-display font-bold text-2xl text-cream block mb-4">
              GingerBros
            </span>
            <p className="font-body text-cream/60 text-[15px] leading-relaxed mb-6">
              Naturally brewed craft ginger beer from Thailand.
            </p>
            <div className="flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/60 hover:text-cream transition-colors"
                  title={s.label}
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <span className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-cream/50 mb-4 block">
              Shop
            </span>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <span className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-cream/50 mb-4 block">
              Company
            </span>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <span className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-cream/50 mb-4 block">
              Contact
            </span>
            <a
              href="mailto:gingerbros.brew@gmail.com"
              className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors block mb-2"
            >
              gingerbros.brew@gmail.com
            </a>
            <p className="font-body font-medium text-[13px] text-cream/40">
              Brewed &amp; bottled in Thailand
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-body font-medium text-[13px] text-cream/40">
            &copy; 2025 GingerBros. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a href="#" className="font-body font-medium text-[13px] text-cream/40 hover:text-cream/70 transition-colors">
              Privacy
            </a>
            <a href="#" className="font-body font-medium text-[13px] text-cream/40 hover:text-cream/70 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
