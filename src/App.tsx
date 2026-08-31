import { Suspense, lazy, useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { I18nProvider } from '@/context/I18nContext';
import Navigation from '@/sections/Navigation';
import CartDrawer from '@/sections/CartDrawer';
import HomePage from '@/pages/HomePage';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import BackToTop from '@/components/BackToTop';
import { REFERRAL_CODE_STORAGE_KEY } from '@/lib/checkout';

/** Loads a shared cart from `?cart=<uuid>` and pre-fills CartContext, then removes the param. */
function CartLinkLoader() {
  const location = useLocation();
  const { clearCart, addItem, openCart } = useCart();
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('cart');
    if (!id) return;
    const params = new URLSearchParams(location.search);
    params.delete('cart');
    window.history.replaceState(null, '', params.toString() ? `?${params}` : window.location.pathname);
    fetch(`/api/share-cart?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          clearCart();
          for (const item of data.items) addItem(item);
          openCart();
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Picks up `?ref=CODE` from a shared referral link and remembers it for checkout. */
function ReferralCapture() {
  const location = useLocation();
  useEffect(() => {
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref) localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, ref.toUpperCase());
  }, [location.search]);
  return null;
}

/**
 * Reset scroll to the top on every route change (but preserve in-page #hash
 * navigation).
 *
 * The subtlety is `ScrollTrigger.refresh()`: it deliberately saves the current
 * scroll position and re-applies it afterwards so that layout recalcs don't
 * make the page jump. On a route change that's exactly wrong — it drags the
 * new page back to the *previous* page's offset a frame after we scrolled to
 * the top, which is what made opening a product land halfway down the page.
 * `clearScrollMemory('manual')` wipes that saved position (and pins
 * `history.scrollRestoration` to manual so the browser doesn't restore one
 * either) before we scroll.
 *
 * Note there is deliberately no `ScrollTrigger.getAll().kill()` here: every
 * section owns its triggers through a `gsap.context` that reverts on unmount,
 * and killing a trigger from the outside leaves its tween frozen mid-flight —
 * which is how sections ended up stuck at partial opacity after a back
 * navigation.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        try {
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
        } catch {
          // Malformed hash — nothing to scroll to.
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    ScrollTrigger.clearScrollMemory('manual');
    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
}

/** Lightweight branded fallback while a lazy page chunk loads. */
function PageLoader() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
    </div>
  );
}

const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const ReturnsPage = lazy(() => import('@/pages/ReturnsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const WholesalePage = lazy(() => import('@/pages/WholesalePage'));
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function AppContent() {
  return (
    <>
      {/* Kept outside Suspense: these are pure side-effect components (scroll
          reset, referral capture, shared-cart loading) with no visual output.
          If they lived inside the Suspense boundary below, navigating to a
          not-yet-loaded lazy route would suspend the whole boundary — including
          these — discarding the in-flight scroll-to-top effect until the lazy
          chunk resolves, so the new page could render mid-scroll (landing on
          the wrong section instead of the top). */}
      <ScrollToTop />
      <ReferralCapture />
      <CartLinkLoader />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order/success" element={<OrderSuccess />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/wholesale" element={<WholesalePage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <ErrorBoundary>
          <Navigation />
          <AppContent />
          <CartDrawer />
        </ErrorBoundary>
        <Toaster position="bottom-right" />
        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </CartProvider>
    </I18nProvider>
  );
}
