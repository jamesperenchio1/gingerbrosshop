import { Routes, Route } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { CartProvider } from '@/context/CartContext';
import { I18nProvider } from '@/context/I18nContext';
import { useLenis } from '@/hooks/useLenis';
import HomePage from '@/pages/HomePage';
import ProductDetail from '@/pages/ProductDetail';
import OrderSuccess from '@/pages/OrderSuccess';
import AdminOrders from '@/pages/AdminOrders';
import FAQPage from '@/pages/FAQPage';
import ShippingPage from '@/pages/ShippingPage';
import ReturnsPage from '@/pages/ReturnsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import WholesalePage from '@/pages/WholesalePage';
import TrackOrderPage from '@/pages/TrackOrderPage';
import BlogPage from '@/pages/BlogPage';
import NotFound from '@/pages/NotFound';

function AppContent() {
  useLenis();

  return (
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <AppContent />
        <Analytics />
      </CartProvider>
    </I18nProvider>
  );
}
