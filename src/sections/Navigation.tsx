import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { CartIcon, MenuIcon, CloseIcon } from '@/components/Icons';

const navLinks = [
  { label: 'Shop', href: '#shop' },
  { label: 'Story', href: '#story' },
  { label: 'Process', href: '#process' },
  { label: 'Benefits', href: '#benefits' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          href="#"
          className="font-display font-bold text-xl text-deep-brown tracking-tight"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          GingerBros
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-body font-medium text-sm uppercase tracking-[0.08em] text-earth hover:text-deep-brown relative group transition-colors duration-200"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rust transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 font-body font-medium text-sm uppercase tracking-[0.08em] text-earth hover:text-deep-brown transition-colors"
          >
            <span className="hidden sm:inline">Cart</span>
            <span className="relative">
              <CartIcon className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-[18px] h-[18px] bg-amber text-deep-brown text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </span>
          </button>
          <span className="hidden sm:inline font-body font-medium text-[13px] text-rust">THB</span>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-deep-brown"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-warm-white/95 backdrop-blur-xl border-t border-soft-peach/50 shadow-lg">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-body font-medium text-sm uppercase tracking-[0.08em] text-earth hover:text-deep-brown transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
