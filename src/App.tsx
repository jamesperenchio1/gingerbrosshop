import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { CartProvider } from '@/context/CartContext';
import { I18nProvider } from '@/context/I18nContext';
import { useLenis } from '@/hooks/useLenis';
import Navigation from '@/sections/Navigation';
import CartDrawer from '@/sections/CartDrawer';
import HomePage from '@/pages/HomePage';

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
    <Suspense fallback={null}>
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
