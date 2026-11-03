import { useEffect, createContext, useContext, useCallback, type ReactNode } from 'react';
import { hasThai, localizedPath } from '@/lib/locale';

export type Locale = 'en' | 'th';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    shop: 'Shop',
    guide: 'Ginger Guide',
    story: 'Our Story',
    ourStory: 'Our Story',
    business: 'For Business',
    findUs: 'Find Us',
    blog: 'Ginger Guide',
    faq: 'FAQ',
    wholesale: 'For Business',
    myOrders: 'My Orders',
    trackOrder: 'Track Order',
    manageSubscription: 'Manage Subscription',
    shipping: 'Shipping',
    returns: 'Returns',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact Us',
    company: 'Company',
    support: 'Support',
    language: 'Language',
    english: 'English',
    thai: 'ไทย',
    skipToContent: 'Skip to content',
    menu: 'Menu',
    closeMenu: 'Close menu',

    // Cart
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
    freeShippingOver: 'Free shipping on orders over ฿500',
    freeShippingUnlocked: 'You unlocked free shipping',

    // Product status
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',

    // Shop
    shopNow: 'Shop Now',
    shopLabel: 'THE SHOP',
    shopTitle: 'Pick your ginger.',
    shopSub: 'Two drinks, one obsession. Grab a bottle or stock the fridge. Multi-buy deals apply automatically in your cart.',
    shopTabDrinks: 'Drinks',
    shopTabEquipment: 'Brewing Equipment',
    mixMatchTitle: 'Mix & match',
    mixMatchSub: "Can't pick? Don't.",
    packSize: 'Pack size',
    perBottle: '/ bottle',
    youSave: 'Save',
    bottles: 'bottles',
    bottle: 'bottle',
    viewDetails: 'View details',
    subscribeStrip: 'Never run dry. Subscribe to Ginger Fizz and get it delivered weekly, fortnightly or monthly.',
    subscribeStripCta: 'Set up a subscription',

    // Order
    orderSuccess: 'Thank You!',
    orderConfirmed: 'Your order has been confirmed.',
    whatsNext: "What's Next?",
    preparingOrder: "We're preparing your order. You'll receive tracking details once it ships.",
    orderShipped: 'Your Order Has Shipped',

    // Hero
    heroBadge: 'Modern ginger drinks · Made in Thailand',
    heroHeadline1: 'Think Ginger.',
    heroHeadline2: 'Drink Different.',
    heroSub: 'A new way to enjoy ginger. Bold flavour, real ingredients, made in Thailand. Ginger with character, refreshment with a kick.',
    heroCtaShop: 'Shop the drinks',
    heroCtaStory: 'How to drink it',
    heroTrust1: 'Fresh Thai ginger',
    heroTrust2: 'Real lime',
    heroTrust3: 'Low sugar',
    tickerExtra1: 'Made in Thailand',
    tickerExtra2: 'Best served ice cold',
    tickerExtra3: "Not your grandma's ginger drink",

    // Lineup
    lineupLabel: 'MEET THE LINEUP',
    lineupTitle: 'Two ways to drink ginger.',
    fizzName: 'Ginger Fizz',
    fizzThai: 'น้ำขิงซ่า',
    fizzTagline: 'Sparkling. Bright. A proper kick.',
    fizzDesc: 'Fresh Thai ginger and real lime with a sharp, lively sparkle. Low in sugar, big on bite. Crack one ice cold on a hot afternoon, or pour it next to anything off the grill.',
    teaName: 'Ginger Tea',
    teaThai: 'ชาขิง · Thai Spice',
    teaTagline: 'Slow-simmered. Warm spice. Smooth.',
    teaDesc: 'Real ginger, slowly simmered with lemongrass, lime and Thai spices. Rich, rounded and still. Brilliant over ice, just as good warmed up on a rainy-season evening.',
    tasteKick: 'Ginger kick',
    tasteSweet: 'Sweetness',
    tasteFizz: 'Fizz',
    tasteSpice: 'Spice',
    tasteCitrus: 'Citrus',
    from: 'From',
    shopFizz: 'Shop Ginger Fizz',
    shopTea: 'Shop Ginger Tea',

    // Manifesto
    manifestoLabel: 'WHY GINGERBROS',
    manifestoTitle: 'Not your ordinary ginger drink.',
    manifestoBody: "Ginger deserves more than a spot in the kitchen cabinet or a sachet at the back of the drawer. We make ginger drinks you actually want to reach for: cold, bold, real, and good enough to share. Ginger, reimagined. One great drink at a time.",
    pillar1Title: 'Ginger first',
    pillar1Desc: 'Ginger is the hero, never the supporting act. You will taste it.',
    pillar2Title: 'Taste before everything',
    pillar2Desc: "We lead with flavour. If it isn't delicious, it doesn't ship.",
    pillar3Title: 'Thai roots, modern pour',
    pillar3Desc: 'Fresh Thai ginger and local ingredients, made in Thailand for right now.',
    manifestoCta: 'Read our story',

    // The GingerBros Way
    wayLabel: 'THE GINGERBROS WAY',
    wayTitle: 'Four ways to get your kick.',
    way1Title: 'Pour it cold',
    way1Desc: 'Fridge-cold bottle, glass full of ice. That is the whole recipe.',
    way2Title: 'Pair it with food',
    way2Desc: 'Som tam, gai yang, khao man gai. Ginger cuts through all of it.',
    way3Title: 'Mix it your way',
    way3Desc: 'Mocktails, highballs, a splash over iced tea. Go wild.',
    way4Title: 'Share the kick',
    way4Desc: 'Better with friends. Bring the six-pack.',
    wayCta: 'Explore the Ginger Guide',

    // Bundles
    bundlesLabel: 'STOCK THE FRIDGE',
    bundlesTitle: 'More bottles, better price.',
    bundlesSub: 'Deals apply automatically in your cart. Mix Fizz and Tea however you like.',

    // Reviews
    reviewsLabel: 'THE VERDICT',
    reviewsTitle: 'People are talking.',

    // Business teaser
    businessLabel: 'FOR CAFÉS, BARS & RESTAURANTS',
    businessTitle: 'Put GingerBros on your menu.',
    businessSub: 'Join the Signature Serve programme: free samples, a recipe card, menu copy and wholesale pricing. Your guests get something new. You get the drink people ask about.',
    businessCta: 'Become a stockist',

    // Story (also the /story page)
    storyLabel: 'OUR STORY',
    storyTitle: 'Rooted in ginger. Made for today.',
    storyPara1: "GingerBros started with a simple question: why does ginger in Thailand still taste like a home remedy? It's in almost every kitchen, yet the drinks made from it are sachets, hot cups and herbal-shop bottles. We wanted ginger that tastes like now. Cold, bright, and a little bit loud.",
    storyPara2: "Thailand grows a huge amount of ginger, yet most of it leaves the country and becomes someone else's product. We'd rather Thai ginger had its moment at home. So we start with fresh Thai ginger, keep the recipe honest (real ginger, real lime, not much sugar) and make every bottle in Thailand.",
    storyPara3: "We're not here to sell you a remedy. We're here to make ginger the drink you grab with friends, with dinner, on a hot afternoon. Think ginger. Drink different.",
    storyCtaProcess: 'Shop the drinks',

    // Newsletter
    newsletterTitle: 'First Access',
    newsletterSub: 'New drops, restocks, and exclusive offers, before anyone else.',
    newsletterVerifyHint: 'Verify your email. Get 10% off your first order.',
    newsletterEmailPlaceholder: 'Enter your email',
    newsletterSubscribeBtn: 'Subscribe',
    newsletterSubscribingBtn: 'Sending…',
    newsletterNoSpam: 'No spam. Unsubscribe any time.',
    newsletterCheckInbox: 'Check your inbox',
    newsletterCodeSentTo: 'We sent a 6-digit code to',
    newsletterClaimBtn: 'Claim my 10% off →',
    newsletterVerifyingBtn: 'Verifying…',
    newsletterResendIn: 'Resend in',
    newsletterResend: 'Resend code',
    newsletterDoneTitle: 'Your discount is on its way.',
    newsletterDoneSub: 'Check your inbox for your 10% off code. It\'s valid for 24 hours.',

    // Footer
    footerBrandBlurb: 'Modern ginger drinks, made in Thailand. Fresh Thai ginger, real lime, low sugar. Think ginger. Drink different.',
    footerCopyright: 'All rights reserved.',
  },

  th: {
    // Nav
    shop: 'ร้านค้า',
    guide: 'คู่มือขิง',
    story: 'เรื่องราวของเรา',
    ourStory: 'เรื่องราวของเรา',
    business: 'สำหรับธุรกิจ',
    findUs: 'ซื้อได้ที่ไหน',
    blog: 'คู่มือขิง',
    faq: 'คำถามที่พบบ่อย',
    wholesale: 'สำหรับธุรกิจ',
    myOrders: 'คำสั่งซื้อของฉัน',
    trackOrder: 'ติดตามคำสั่งซื้อ',
    manageSubscription: 'จัดการการสมัครสมาชิก',
    shipping: 'การจัดส่ง',
    returns: 'การคืนสินค้า',
    privacy: 'ความเป็นส่วนตัว',
    terms: 'ข้อกำหนด',
    contact: 'ติดต่อเรา',
    company: 'บริษัท',
    support: 'ช่วยเหลือ',
    language: 'ภาษา',
    english: 'English',
    thai: 'ไทย',
    skipToContent: 'ข้ามไปยังเนื้อหา',
    menu: 'เมนู',
    closeMenu: 'ปิดเมนู',

    // Cart
    cart: 'ตะกร้า',
    addToCart: 'ใส่ตะกร้า',
    subscribeSave: 'สมัครสมาชิกและประหยัด',
    checkout: 'ชำระเงิน',
    subtotal: 'ยอดรวม',
    shippingAtCheckout: 'ค่าจัดส่งคำนวณที่หน้าชำระเงิน',
    continueShopping: 'เลือกซื้อสินค้าต่อ',
    yourCart: 'ตะกร้าสินค้า',
    cartEmpty: 'ตะกร้าของคุณว่างเปล่า',
    startShopping: 'เริ่มช้อปปิ้ง',
    freeShippingOver: 'จัดส่งฟรีสำหรับคำสั่งซื้อเกิน ฿500',
    freeShippingUnlocked: 'คุณได้รับสิทธิ์จัดส่งฟรี',

    // Product status
    inStock: 'มีสินค้า',
    lowStock: 'สินค้าใกล้หมด',
    outOfStock: 'สินค้าหมด',

    // Shop
    shopNow: 'ช้อปเลย',
    shopLabel: 'ร้านค้า',
    shopTitle: 'เลือกขิงของคุณ',
    shopSub: 'สองเครื่องดื่ม หนึ่งความหลงใหล จะหยิบขวดเดียวหรือตุนเต็มตู้ก็ได้ ส่วนลดซื้อหลายขวดคิดให้อัตโนมัติในตะกร้า',
    shopTabDrinks: 'เครื่องดื่ม',
    shopTabEquipment: 'อุปกรณ์ทำเบียร์',
    mixMatchTitle: 'มิกซ์แอนด์แมตช์',
    mixMatchSub: 'เลือกไม่ได้? เอาทั้งคู่',
    packSize: 'จำนวนขวด',
    perBottle: '/ ขวด',
    youSave: 'ประหยัด',
    bottles: 'ขวด',
    bottle: 'ขวด',
    viewDetails: 'ดูรายละเอียด',
    subscribeStrip: 'ไม่มีวันขาดตู้ สมัครรับน้ำขิงซ่าส่งถึงบ้านทุกสัปดาห์ ทุกสองสัปดาห์ หรือทุกเดือน',
    subscribeStripCta: 'สมัครรับสินค้าประจำ',

    // Order
    orderSuccess: 'ขอบคุณ!',
    orderConfirmed: 'คำสั่งซื้อของคุณได้รับการยืนยันแล้ว',
    whatsNext: 'ขั้นตอนต่อไป',
    preparingOrder: 'เรากำลังเตรียมคำสั่งซื้อของคุณ คุณจะได้รับรายละเอียดการติดตามเมื่อจัดส่ง',
    orderShipped: 'คำสั่งซื้อของคุณจัดส่งแล้ว',

    // Hero
    heroBadge: 'เครื่องดื่มขิงยุคใหม่ · ผลิตในประเทศไทย',
    heroHeadline1: 'คิดแบบขิง',
    heroHeadline2: 'ดื่มให้แตกต่าง',
    heroSub: 'ขิงในแบบที่คุณไม่เคยดื่ม รสชาติจัดจ้าน วัตถุดิบจริง ผลิตในประเทศไทย ขิงที่มีคาแรกเตอร์ สดชื่นแบบเผ็ดซ่าถึงใจ',
    heroCtaShop: 'ช้อปเครื่องดื่ม',
    heroCtaStory: 'ดื่มยังไงให้อร่อย',
    heroTrust1: 'ขิงไทยสด',
    heroTrust2: 'มะนาวแท้',
    heroTrust3: 'หวานน้อย',
    tickerExtra1: 'ผลิตในประเทศไทย',
    tickerExtra2: 'อร่อยสุดตอนเย็นจัด',
    tickerExtra3: 'ไม่ใช่น้ำขิงแบบที่บ้านยาย',

    // Lineup
    lineupLabel: 'ทำความรู้จัก',
    lineupTitle: 'ขิงสองสไตล์ ดื่มได้ทุกวัน',
    fizzName: 'Ginger Fizz',
    fizzThai: 'น้ำขิงซ่า',
    fizzTagline: 'ซ่า สดใส เผ็ดกำลังดี',
    fizzDesc: 'ขิงไทยสดกับมะนาวแท้ ซ่าแบบสะใจ หวานน้อยแต่เผ็ดชัด เปิดขวดเย็น ๆ ตอนบ่ายร้อน ๆ หรือดื่มคู่กับของปิ้งย่าง',
    teaName: 'Ginger Tea',
    teaThai: 'ชาขิง · Thai Spice',
    teaTagline: 'ต้มช้า เครื่องเทศหอม กลมกล่อม',
    teaDesc: 'ขิงแท้ต้มช้า ๆ กับตะไคร้ มะนาว และเครื่องเทศไทย รสเข้มกลมกล่อม ไม่ซ่า ดื่มกับน้ำแข็งก็อร่อย อุ่น ๆ หน้าฝนก็ดี',
    tasteKick: 'ความเผ็ดขิง',
    tasteSweet: 'ความหวาน',
    tasteFizz: 'ความซ่า',
    tasteSpice: 'เครื่องเทศ',
    tasteCitrus: 'ความเปรี้ยวสดชื่น',
    from: 'เริ่มต้น',
    shopFizz: 'ช้อปน้ำขิงซ่า',
    shopTea: 'ช้อปชาขิง',

    // Manifesto
    manifestoLabel: 'ทำไมต้อง GINGERBROS',
    manifestoTitle: 'ไม่ใช่น้ำขิงแบบที่คุณคุ้นเคย',
    manifestoBody: 'ขิงควรได้มากกว่าการอยู่ในตู้ครัวหรือซองน้ำขิงท้ายลิ้นชัก เราทำเครื่องดื่มขิงที่คุณอยากหยิบจริง ๆ เย็น จัดจ้าน ของจริง และอร่อยพอจะแบ่งเพื่อน ขิงในแบบใหม่ ทีละขวด',
    pillar1Title: 'ขิงคือพระเอก',
    pillar1Desc: 'ขิงไม่เคยเป็นตัวประกอบ ดื่มแล้วรู้เลย',
    pillar2Title: 'อร่อยต้องมาก่อน',
    pillar2Desc: 'เราเริ่มจากรสชาติ ถ้าไม่อร่อย เราไม่ขาย',
    pillar3Title: 'รากไทย สไตล์ใหม่',
    pillar3Desc: 'ขิงไทยสดและวัตถุดิบท้องถิ่น ผลิตในประเทศไทย สำหรับคนยุคนี้',
    manifestoCta: 'อ่านเรื่องราวของเรา',

    // The GingerBros Way
    wayLabel: 'สไตล์ GINGERBROS',
    wayTitle: 'สี่วิธีดื่มขิงให้สุด',
    way1Title: 'ดื่มเย็น ๆ',
    way1Desc: 'ขวดเย็นจากตู้ แก้วเต็มน้ำแข็ง แค่นั้นเลย',
    way2Title: 'กินคู่กับอาหาร',
    way2Desc: 'ส้มตำ ไก่ย่าง ข้าวมันไก่ ขิงตัดเลี่ยนได้หมด',
    way3Title: 'มิกซ์ในแบบคุณ',
    way3Desc: 'ม็อกเทล ไฮบอล หรือเติมลงชาเย็น จัดเต็มได้เลย',
    way4Title: 'แบ่งกันซ่า',
    way4Desc: 'ดื่มกับเพื่อนอร่อยกว่า หิ้วไปทั้งแพ็ก',
    wayCta: 'ดูคู่มือขิง',

    // Bundles
    bundlesLabel: 'ตุนไว้ในตู้เย็น',
    bundlesTitle: 'ยิ่งซื้อเยอะ ยิ่งคุ้ม',
    bundlesSub: 'ส่วนลดคิดให้อัตโนมัติในตะกร้า ผสมน้ำขิงซ่ากับชาขิงได้ตามใจ',

    // Reviews
    reviewsLabel: 'รีวิวจากลูกค้า',
    reviewsTitle: 'เสียงจากคนที่ได้ลอง',

    // Business teaser
    businessLabel: 'สำหรับคาเฟ่ บาร์ และร้านอาหาร',
    businessTitle: 'ใส่ GingerBros ในเมนูของคุณ',
    businessSub: 'เข้าร่วมโปรแกรม Signature Serve รับตัวอย่างฟรี การ์ดสูตรเครื่องดื่ม คำบรรยายเมนู และราคาขายส่ง ลูกค้าได้ลองของใหม่ ร้านคุณได้เมนูที่คนถามถึง',
    businessCta: 'สมัครเป็นร้านค้าพันธมิตร',

    // Story
    storyLabel: 'เรื่องราวของเรา',
    storyTitle: 'รากเหง้าคือขิง ทำมาเพื่อวันนี้',
    storyPara1: 'GingerBros เริ่มจากคำถามง่าย ๆ ว่า ทำไมขิงในเมืองไทยยังมีภาพเป็นยาสามัญประจำบ้าน ทั้งที่ขิงอยู่ในแทบทุกครัว แต่เครื่องดื่มขิงที่เจอกลับมีแค่แบบซอง แบบชงร้อน หรือขวดจากร้านสมุนไพร เราอยากได้ขิงที่รสชาติเป็นของยุคนี้ เย็น สดใส และจัดจ้านนิด ๆ',
    storyPara2: 'ไทยปลูกขิงได้มหาศาล แต่ส่วนใหญ่ถูกส่งออกไปเป็นสินค้าของคนอื่น เราอยากให้ขิงไทยได้เฉิดฉายที่บ้านเกิด เราจึงเริ่มจากขิงไทยสด ใช้สูตรที่ตรงไปตรงมา ขิงจริง มะนาวจริง หวานน้อย และผลิตทุกขวดในประเทศไทย',
    storyPara3: 'เราไม่ได้มาขายยา เรามาทำให้ขิงเป็นเครื่องดื่มที่คุณหยิบตอนอยู่กับเพื่อน ตอนกินข้าว หรือตอนบ่ายที่ร้อนจัด คิดแบบขิง ดื่มให้แตกต่าง',
    storyCtaProcess: 'ช้อปเครื่องดื่ม',

    // Newsletter
    newsletterTitle: 'สิทธิ์ก่อนใคร',
    newsletterSub: 'เครื่องดื่มใหม่ การเติมสต็อก และโปรโมชั่นพิเศษ, รู้ก่อนคนอื่น',
    newsletterVerifyHint: 'ยืนยันอีเมล รับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก',
    newsletterEmailPlaceholder: 'กรอกอีเมลของคุณ',
    newsletterSubscribeBtn: 'สมัครรับข้อมูล',
    newsletterSubscribingBtn: 'กำลังส่ง…',
    newsletterNoSpam: 'ไม่มีสแปม ยกเลิกได้ทุกเมื่อ',
    newsletterCheckInbox: 'ตรวจสอบกล่องขาเข้า',
    newsletterCodeSentTo: 'เราส่งรหัส 6 หลักไปที่',
    newsletterClaimBtn: 'รับส่วนลด 10% ของฉัน →',
    newsletterVerifyingBtn: 'กำลังตรวจสอบ…',
    newsletterResendIn: 'ส่งใหม่ใน',
    newsletterResend: 'ส่งรหัสใหม่',
    newsletterDoneTitle: 'ส่วนลดของคุณกำลังมา',
    newsletterDoneSub: 'ตรวจสอบกล่องขาเข้าของคุณสำหรับรหัสส่วนลด 10% ใช้ได้ภายใน 24 ชั่วโมง',

    // Footer
    footerBrandBlurb: 'เครื่องดื่มขิงยุคใหม่ ผลิตในประเทศไทย ขิงไทยสด มะนาวแท้ หวานน้อย คิดแบบขิง ดื่มให้แตกต่าง',
    footerCopyright: 'สงวนลิขสิทธิ์',
  },
};

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LOCALE_KEY = 'gingerbros-locale';

/**
 * Swap language in place: push the new URL in the shape React Router's history
 * uses, then fire popstate so the router and the basename in main.tsx both
 * pick it up. No reload, so scroll position and cart state stay put.
 */
function pushUrl(url: string) {
  const state = { usr: null, key: Math.random().toString(36).slice(2, 10), idx: (window.history.state?.idx ?? 0) + 1 };
  window.history.pushState(state, '', url);
  window.dispatchEvent(new PopStateEvent('popstate', { state }));
}

/**
 * The locale comes from the URL (see src/lib/locale.ts), so server and client
 * always agree and Thai pages are crawlable. Switching language moves to the
 * other URL; the choice is remembered so a Thai visitor landing on an English
 * page that has a Thai version is sent there.
 */
export function I18nProvider({ children, locale }: { children: ReactNode; locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      const saved = localStorage.getItem(LOCALE_KEY);
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      if (saved === 'th' && locale === 'en' && hasThai(path)) {
        window.location.replace(localizedPath(path, 'th') + window.location.search + window.location.hash);
      }
    } catch { /* storage unavailable */ }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    try { localStorage.setItem(LOCALE_KEY, l); } catch { /* ignore */ }
    if (l === locale) return;
    const current = window.location.pathname;
    // Collapse leading slashes/backslashes so a path like "//evil.com" can
    // never become a protocol-relative (off-site) redirect.
    const safe = `/${current.replace(/^[/\\]+/, '')}`;
    const routerPath = locale === 'th' ? safe.replace(/^\/th(?=\/|$)/, '') || '/' : safe;
    const target = hasThai(routerPath.replace(/\/$/, '') || '/') ? localizedPath(routerPath, l) : routerPath;
    if (l === 'th' && target === routerPath) {
      // No Thai version of this page yet: go to the Thai homepage instead.
      pushUrl('/th');
      return;
    }
    // Final guard: only ever navigate within this origin.
    const url = new URL(`/${target.replace(/^[/\\]+/, '')}${window.location.search}`, window.location.origin);
    if (url.origin !== window.location.origin) { window.location.href = '/'; return; }
    pushUrl(url.pathname + url.search);
  }, [locale]);

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
