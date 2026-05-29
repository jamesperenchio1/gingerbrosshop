import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'th';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    shop: 'Shop',
    story: 'Story',
    process: 'Process',
    benefits: 'Benefits',
    cart: 'Cart',
    addToCart: 'Add to Cart',
    subscribeSave: 'Subscribe & Save',
    checkout: 'Checkout with Stripe',
    subtotal: 'Subtotal',
    shippingAtCheckout: 'Shipping calculated at checkout',
    continueShopping: 'Continue Shopping',
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    startShopping: 'Start shopping',
    inStock: 'In Stock',
    chooseYourBrew: 'Choose Your Brew',
    ourProducts: 'Our Products',
    naturallyBrewed: 'Naturally Brewed in Thailand',
    shopNow: 'Shop Now',
    ourStory: 'Our Story',
    freeShippingOver: 'Free shipping on orders over ฿500',
    orderSuccess: 'Thank You!',
    orderConfirmed: 'Your order has been confirmed.',
    trackOrder: 'Track My Order',
    whatsNext: "What's Next?",
    preparingOrder: "We're preparing your order. You'll receive tracking details once it ships.",
    orderShipped: 'Your Order Has Shipped',
  },
  th: {
    shop: 'ร้านค้า',
    story: 'เรื่องราว',
    process: 'กระบวนการ',
    benefits: 'ประโยชน์',
    cart: 'ตะกร้า',
    addToCart: 'ใส่ตะกร้า',
    subscribeSave: 'สมัครสมาชิก & ประหยัด',
    checkout: 'ชำระเงินผ่าน Stripe',
    subtotal: 'ยอดรวม',
    shippingAtCheckout: 'ค่าจัดส่งคำนวณที่หน้าชำระเงิน',
    continueShopping: 'เลือกซื้อสินค้าต่อ',
    yourCart: 'ตะกร้าสินค้า',
    cartEmpty: 'ตะกร้าของคุณว่างเปล่า',
    startShopping: 'เริ่มช้อปปิ้ง',
    inStock: 'มีสินค้า',
    chooseYourBrew: 'เลือกเบียร์ขิงของคุณ',
    ourProducts: 'สินค้าของเรา',
    naturallyBrewed: 'หมักตามธรรมชาติในประเทศไทย',
    shopNow: 'ช้อปเลย',
    ourStory: 'เรื่องราวของเรา',
    freeShippingOver: 'จัดส่งฟรีสำหรับคำสั่งซื้อเกิน ฿500',
    orderSuccess: 'ขอบคุณ!',
    orderConfirmed: 'คำสั่งซื้อของคุณได้รับการยืนยันแล้ว',
    trackOrder: 'ติดตามคำสั่งซื้อ',
    whatsNext: 'ต่อไปนี้?',
    preparingOrder: 'เรากำลังเตรียมคำสั่งซื้อของคุณ คุณจะได้รับรายละเอียดการติดตามเมื่อจัดส่ง',
    orderShipped: 'คำสั่งซื้อของคุณจัดส่งแล้ว',
  },
};

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      return (localStorage.getItem('gingerbros-locale') as Locale) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('gingerbros-locale', l); } catch { /* ignore */ }
    document.documentElement.lang = l;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'th' : 'en');
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
