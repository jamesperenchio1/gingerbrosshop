import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { useCart } from '@/context/CartContext';
import { useI18n } from '@/context/I18nContext';
import { CartIcon, MenuIcon, CloseIcon } from '@/components/Icons';

const navLinks = [
  { key: 'shop', to: '/shop' },
  { key: 'guide', to: '/guide' },
  { key: 'story', to: '/story' },
  { key: 'business', to: '/business' },
  { key: 'findUs', to: '/find-us' },
];

// Extra utility links in the mobile menu.
const mobileOnlyLinks = [
  { key: 'myOrders', to: '/orders' },
  { key: 'trackOrder', to: '/track' },
  { key: 'faq', to: '/faq' },
];

function LanguageToggle({ dark }: { dark: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const idle = dark ? 'text-cream/85 hover:text-cream' : 'text-earth hover:text-deep-brown';
  const on = dark ? 'bg-cream text-charcoal' : 'bg-charcoal text-cream';
  return (
    <div role="group" aria-label={t('language')} className={`flex items-center overflow-hidden rounded-full border ${dark ? 'border-cream/30' : 'border-charcoal/20'}`}>
      {(['en', 'th'] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`px-2.5 py-1 font-body text-[11px] font-semibold transition-colors ${locale === l ? on : idle}`}
        >
          {l === 'en' ? 'EN' : 'ไทย'}
        </button>
      ))}
    </div>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const { t } = useI18n();
  const { pathname } = useLocation();
  // The homepage hero is charcoal: the bar starts transparent with light text.
  const dark = pathname === '/' && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu on navigation
  useEffect(() => setMobileOpen(false), [pathname]);

  const ink = dark ? 'text-cream' : 'text-charcoal';
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `relative font-body text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors ${ink} ${
      isActive ? 'after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:bg-ginger' : 'opacity-90 hover:opacity-100'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,height] duration-300 ${
        dark ? 'h-[72px] bg-transparent' : 'h-16 bg-warm-white/95 shadow-sm backdrop-blur-xl'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="GingerBros home" className={`font-poster text-[1.7rem] normal-case tracking-[-0.03em] ${ink}`}>
          GingerBros<span className="text-ginger">.</span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className={linkCls}>{t(l.key)}</NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageToggle dark={dark} />
          </div>
          <button
            type="button"
            onClick={toggleCart}
            data-testid="cart-button"
            aria-label={totalItems > 0 ? `Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}` : 'Cart'}
            className={`relative flex items-center gap-2 rounded-full px-3 py-2 font-body text-[13px] font-semibold uppercase tracking-[0.1em] ${dark ? 'bg-cream/10 text-cream hover:bg-cream/20' : 'bg-charcoal text-cream hover:bg-deep-brown'}`}
          >
            <CartIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{t('cart')}</span>
            {totalItems > 0 && (
              <span aria-hidden="true" data-testid="cart-count" className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-ginger px-1 text-[11px] font-bold text-charcoal">
                {totalItems}
              </span>
            )}
            <span aria-live="polite" className="sr-only">
              {totalItems > 0 ? `${totalItems} item${totalItems === 1 ? '' : 's'} in cart` : ''}
            </span>
          </button>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button type="button" aria-label={t('menu')} className={`-mr-2 p-2.5 lg:hidden ${ink}`}>
                <MenuIcon />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-charcoal/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed inset-y-0 right-0 z-[61] flex w-[min(88vw,380px)] flex-col overflow-y-auto bg-charcoal p-6 text-cream shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
                <div className="mb-8 flex items-center justify-between">
                  <Dialog.Title className="font-poster text-[1.6rem] normal-case">GingerBros<span className="text-ginger">.</span></Dialog.Title>
                  <Dialog.Close aria-label={t('closeMenu')} className="p-2">
                    <CloseIcon />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
                <ul className="space-y-1">
                  {navLinks.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} onClick={() => setMobileOpen(false)} className="block py-2 font-poster text-[2.4rem] hover:text-ginger">{t(l.key)}</Link>
                    </li>
                  ))}
                </ul>
                <ul className="mt-8 space-y-3 border-t border-cream/15 pt-6">
                  {mobileOnlyLinks.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} onClick={() => setMobileOpen(false)} className="font-body text-[15px] text-cream/90 hover:text-ginger">{t(l.key)}</Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <span className="font-body text-[13px] uppercase tracking-[0.1em] text-cream/85">{t('language')}</span>
                  <LanguageToggle dark />
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </nav>
    </header>
  );
}
