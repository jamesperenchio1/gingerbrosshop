import { InstagramIcon, FacebookIcon, TikTokIcon, LineIcon } from '@/components/Icons';
import { useNavigate } from 'react-router';

const socials = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/gingerbrosbrew' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61573086524067' },
  { icon: TikTokIcon, label: 'TikTok', href: 'https://www.tiktok.com/@gingerbrosbrew' },
  { icon: LineIcon, label: 'Line', href: 'https://line.me/R/ti/p/@852nqred?ts=07142313&oat_content=url' },
];

export default function Footer() {
  const navigate = useNavigate();

  const link = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-deep-brown text-cream pt-20 pb-10">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div>
            <span className="font-display font-bold text-2xl text-cream block mb-4">GingerBros</span>
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
            <span className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-cream/50 mb-4 block">Shop</span>
            <ul className="space-y-3">
              <li><a href="/product/unpasteurized" onClick={link('/product/unpasteurized')} className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">Unpasteurized</a></li>
              <li><a href="https://shopee.co.th/gingerbros" target="_blank" rel="noopener noreferrer" className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">Shopee Store</a></li>
              <li><a href="/wholesale" onClick={link('/wholesale')} className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">Wholesale</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <span className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-cream/50 mb-4 block">Support</span>
            <ul className="space-y-3">
              <li><a href="/faq" onClick={link('/faq')} className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">FAQ</a></li>
              <li><a href="/shipping" onClick={link('/shipping')} className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">Shipping</a></li>
              <li><a href="/returns" onClick={link('/returns')} className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">Returns</a></li>
              <li><a href="/track" onClick={link('/track')} className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">Track Order</a></li>
              <li><a href="/blog" onClick={link('/blog')} className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <span className="font-body font-semibold text-[11px] uppercase tracking-[0.08em] text-cream/50 mb-4 block">Contact</span>
            <a href="mailto:gingerbros.brew@gmail.com" className="font-body text-cream/70 text-[15px] hover:text-cream transition-colors block mb-2">
              gingerbros.brew@gmail.com
            </a>
            <p className="font-body font-medium text-[13px] text-cream/40">Brewed &amp; bottled in Thailand</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-body font-medium text-[13px] text-cream/40">
            &copy; 2025 GingerBros. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a href="/privacy" onClick={link('/privacy')} className="font-body font-medium text-[13px] text-cream/40 hover:text-cream/70 transition-colors">Privacy</a>
            <a href="/terms" onClick={link('/terms')} className="font-body font-medium text-[13px] text-cream/40 hover:text-cream/70 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
