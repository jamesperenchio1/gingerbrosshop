import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useCart } from '@/context/CartContext';
import { useI18n } from '@/context/I18nContext';
import { CartIcon, MenuIcon, CloseIcon } from '@/components/Icons';

const navLinks = [
  { key: 'shop', href: '#shop' },
  { key: 'story', href: '#story' },
  { key: 'process', href: '#process' },
  { key: 'benefits', href: '#prebiotics' },
];

// Only shown in the mobile menu — utility pages that otherwise have no nav
// entry point at all (previously reachable only via footer or direct URL).
const mobileOnlyLinks = [
  { key: 'myOrders', to: '/orders', label: 'My Orders' },
  { key: 'trackOrder', to: '/track' },
  { key: 'wholesale', to: '/wholesale' },
  { key: 'faq', to: '/faq' },
];

function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center rounded-full border border-soft-peach/80 overflow-hidden">
      <button
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={`px-2 py-1 text-[11px] font-body font-medium transition-colors ${
          locale === 'en'
            ? 'bg-deep-brown text-cream'
            : 'bg-transparent text-earth hover:text-deep-brown'
        }`}
      >
        {t('english')}
      </button>
      <button
        onClick={() => setLocale('th')}
        aria-pressed={locale === 'th'}
        className={`px-2 py-1 text-[11px] font-body font-medium transition-colors ${
          locale === 'th'
            ? 'bg-deep-brown text-cream'
            : 'bg-transparent text-earth hover:text-deep-brown'
        }`}
      >
        {t('thai')}
      </button>
    </div>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (isHome) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${href}`);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleMobileLinkNavigate = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    e.preventDefault();
    setMobileOpen(false);
    navigate(to);
  };

  // Match the cart drawer's behavior: close on Escape, lock body scroll while open.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'h-14 bg-warm-white/95 backdrop-blur-xl shadow-sm'
          : 'h-[72px] bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Wordmark */}
        <a
          href="/"
          className="font-display font-bold text-xl text-deep-brown tracking-tight"
          onClick={handleLogoClick}
        >
          GingerBros
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-body font-medium text-sm uppercase tracking-[0.08em] text-earth hover:text-deep-brown relative group transition-colors duration-200"
            >
              {t(link.key)}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rust transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          <button
            onClick={toggleCart}
            data-testid="cart-button"
            aria-label={totalItems > 0 ? `Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}` : 'Cart'}
            className="flex items-center gap-2 font-body font-medium text-sm uppercase tracking-[0.08em] text-earth hover:text-deep-brown transition-colors"
          >
            <span className="hidden sm:inline">{t('cart')}</span>
            <span className="relative">
              <CartIcon className="w-5 h-5" />
              {totalItems > 0 && (
                <span aria-hidden="true" className="absolute -top-2 -right-2 w-[18px] h-[18px] bg-amber text-deep-brown text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </span>
            <span aria-live="polite" className="sr-only">
              {totalItems > 0 ? `${totalItems} item${totalItems === 1 ? '' : 's'} in cart` : ''}
            </span>
          </button>
          <span className="hidden sm:inline font-body font-medium text-[13px] text-rust">THB</span>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-deep-brown p-2.5 -mr-2.5"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-nav-menu" className="md:hidden absolute top-full left-0 right-0 bg-warm-white/95 backdrop-blur-xl border-t border-soft-peach/50 shadow-lg">
          <div className="flex flex-col px-6 py-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center py-3 font-body font-medium text-sm uppercase tracking-[0.08em] text-earth hover:text-deep-brown transition-colors border-b border-soft-peach/30 last:border-0"
              >
                {t(link.key)}
              </a>
            ))}
            {mobileOnlyLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => handleMobileLinkNavigate(e, link.to)}
                className="flex items-center py-3 font-body font-medium text-sm uppercase tracking-[0.08em] text-earth hover:text-deep-brown transition-colors border-b border-soft-peach/30 last:border-0"
              >
                {t(link.key)}
              </a>
            ))}
            <div className="py-3 flex items-center justify-between border-b border-soft-peach/30">
              <span className="font-body font-medium text-sm uppercase tracking-[0.08em] text-earth">
                {t('language')}
              </span>
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
