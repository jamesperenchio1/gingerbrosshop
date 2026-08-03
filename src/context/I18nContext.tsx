import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'th';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    shop: 'Shop',
    story: 'Story',
    process: 'Process',
    benefits: 'Benefits',
    blog: 'Blog',
    faq: 'FAQ',
    wholesale: 'Wholesale',
    myOrders: 'My Orders',
    trackOrder: 'Track Order',
    shipping: 'Shipping',
    returns: 'Returns',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact Us',
    company: 'Company',
    support: 'Support',
    cart: 'Cart',
    addToCart: 'Add to Cart',
    subscribeSave: 'Subscribe & Save',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    shippingAtCheckout: 'Shipping calculated at checkout',
    continueShopping: 'Continue Shopping',
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    startShopping: 'Start shopping',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    chooseYourBrew: 'Choose Your Brew',
    ourProducts: 'Our Products',
    naturallyBrewed: 'Naturally Brewed in Thailand',
    shopNow: 'Shop Now',
    ourStory: 'Our Story',
    freeShippingOver: 'Free shipping on orders over ฿500',
    freeShippingUnlocked: 'You unlocked free shipping',
    orderSuccess: 'Thank You!',
    orderConfirmed: 'Your order has been confirmed.',
    whatsNext: "What's Next?",
    preparingOrder: "We're preparing your order. You'll receive tracking details once it ships.",
    orderShipped: 'Your Order Has Shipped',
    language: 'Language',
    english: 'English',
    thai: 'ไทย',
  },
  th: {
    shop: 'ร้านค้า',
    story: 'เรื่องราว',
    process: 'กระบวนการ',
    benefits: 'ประโยชน์',
    blog: 'บล็อก',
    faq: 'คำถามที่พบบ่อย',
    wholesale: 'ขายส่ง',
    myOrders: 'คำสั่งซื้อของฉัน',
    trackOrder: 'ติดตามคำสั่งซื้อ',
    shipping: 'การจัดส่ง',
    returns: 'การคืนสินค้า',
    privacy: 'ความเป็นส่วนตัว',
    terms: 'ข้อกำหนด',
    contact: 'ติดต่อเรา',
    company: 'บริษัท',
    support: 'ช่วยเหลือ',
    cart: 'ตะกร้า',
    addToCart: 'ใส่ตะกร้า',
    subscribeSave: 'สมัครสมาชิก & ประหยัด',
    checkout: 'ชำระเงิน',
    subtotal: 'ยอดรวม',
    shippingAtCheckout: 'ค่าจัดส่งคำนวณที่หน้าชำระเงิน',
    continueShopping: 'เลือกซื้อสินค้าต่อ',
    yourCart: 'ตะกร้าสินค้า',
    cartEmpty: 'ตะกร้าของคุณว่างเปล่า',
    startShopping: 'เริ่มช้อปปิ้ง',
    inStock: 'มีสินค้า',
    lowStock: 'สินค้าใกล้หมด',
    outOfStock: 'สินค้าหมด',
    chooseYourBrew: 'เลือกเบียร์ขิงของคุณ',
    ourProducts: 'สินค้าของเรา',
    naturallyBrewed: 'หมักตามธรรมชาติในประเทศไทย',
    shopNow: 'ช้อปเลย',
    ourStory: 'เรื่องราวของเรา',
    freeShippingOver: 'จัดส่งฟรีสำหรับคำสั่งซื้อเกิน ฿500',
    freeShippingUnlocked: 'คุณได้รับสิทธิ์จัดส่งฟรี',
    orderSuccess: 'ขอบคุณ!',
    orderConfirmed: 'คำสั่งซื้อของคุณได้รับการยืนยันแล้ว',
    whatsNext: 'ต่อไปนี้?',
    preparingOrder: 'เรากำลังเตรียมคำสั่งซื้อของคุณ คุณจะได้รับรายละเอียดการติดตามเมื่อจัดส่ง',
    orderShipped: 'คำสั่งซื้อของคุณจัดส่งแล้ว',
    language: 'ภาษา',
    english: 'English',
    thai: 'ไทย',
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
