import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { CartProvider } from '@/context/CartContext';
import { I18nProvider } from '@/context/I18nContext';
import { useLenis } from '@/hooks/useLenis';
import Navigation from '@/sections/Navigation';
import CartDrawer from '@/sections/CartDrawer';
import HomePage from '@/pages/HomePage';

/**
 * Reset scroll to the top on every route change (but preserve in-page #hash
 * navigation). Without this, navigating between pages keeps the previous scroll
 * position, which feels broken.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
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
const NotFound = lazy(() => import('@/pages/NotFound'));

function AppContent() {
  useLenis();

  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <Navigation />
        <AppContent />
        <CartDrawer />
        <Analytics />
      </CartProvider>
    </I18nProvider>
  );
}
