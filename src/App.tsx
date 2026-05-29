import { Routes, Route } from 'react-router';
import { CartProvider } from '@/context/CartContext';
import { useLenis } from '@/hooks/useLenis';
import HomePage from '@/pages/HomePage';
import ProductDetail from '@/pages/ProductDetail';

function AppContent() {
  useLenis();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
