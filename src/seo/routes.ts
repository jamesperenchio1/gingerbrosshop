/**
 * Single source of truth for the SEO of every static route.
 *
 * Read by: the <SEO route="…"> component (page head), the edge middleware
 * (non-prerendered fallback + 404 pages), scripts/prerender.mjs (route list,
 * sitemap, robots-adjacent rules), src/lib/locale.ts (which pages have Thai) and
 * scripts/seo-audit.mjs. Do not repeat a title or description anywhere else.
 *
 * Imports are relative and dependency-free on purpose: the edge middleware is
 * not built by Vite and cannot resolve the `@/` alias.
 *
 * Brand rules: lead with taste, no health or fermentation claims (see
 * tests/unit/brand-claims.test.ts). Titles carry the "| GingerBros" suffix here.
 */
import { DEFAULT_OG_IMAGE, SITE_URL } from '../constants/site';

export interface RouteSeo {
  title: string;
  description: string;
  /** Thai copy; a route with it gets a /th version, hreflang and a sitemap alternate. */
  titleTh?: string;
  descriptionTh?: string;
  image?: string;
  /** false = noindex, left out of the sitemap, never given hreflang. */
  indexable?: boolean;
  /** false = not rendered at build time (served from the SPA shell + edge meta). */
  prerender?: boolean;
}

export const ROUTE_SEO: Record<string, RouteSeo> = {
  '/': {
    title: 'GingerBros | Ginger Fizz & Ginger Tea from Thailand',
    description:
      'Modern ginger drinks made in Thailand. Ginger Fizz and Ginger Tea with fresh Thai ginger, real lime and low sugar. Order online, delivered nationwide.',
    titleTh: 'GingerBros | น้ำขิงซ่า & ชาขิง เครื่องดื่มขิงยุคใหม่ ผลิตในไทย',
    descriptionTh: 'คิดแบบขิง ดื่มให้แตกต่าง น้ำขิงซ่าและชาขิงจากขิงไทยสด มะนาวแท้ หวานน้อย สั่งออนไลน์ส่งทั่วไทย',
  },
  '/shop': {
    title: 'Shop Ginger Fizz, Ginger Tea & Multi-Buy Packs | GingerBros',
    description:
      'Buy Ginger Fizz and Ginger Tea online in Thailand. Singles, 2, 3 and 6-packs, mix-and-match bundles and subscriptions. Deals apply automatically.',
    titleTh: 'ช้อปน้ำขิงซ่า ชาขิง และแพ็กสุดคุ้ม | GingerBros',
    descriptionTh: 'สั่งน้ำขิงซ่าและชาขิงออนไลน์ ส่งทั่วไทย ขวดเดี่ยว แพ็ก 2, 3 และ 6 ขวด ผสมได้ตามใจ ส่วนลดคิดอัตโนมัติ',
  },
  '/story': {
    title: 'Our Story: Rooted in Ginger, Made for Today | GingerBros',
    description:
      'Why GingerBros exists: to make Thai ginger the drink you actually want to reach for. Fresh Thai ginger, real lime, low sugar, made in Thailand.',
    titleTh: 'เรื่องราวของเรา | GingerBros',
    descriptionTh: 'ทำไม GingerBros ถึงเกิดขึ้น: ทำให้ขิงไทยเป็นเครื่องดื่มที่คุณอยากหยิบ ขิงไทยสด มะนาวแท้ หวานน้อย ผลิตในประเทศไทย',
  },
  '/faq': {
    title: 'FAQ: Delivery, Subscriptions & Storage | GingerBros',
    description:
      'Answers on GingerBros delivery, cold-chain shipping, subscriptions, storage, payments and wholesale. Ginger Fizz and Ginger Tea, made in Thailand.',
    titleTh: 'คำถามที่พบบ่อย: การจัดส่ง สมัครสมาชิก การเก็บรักษา | GingerBros',
    descriptionTh:
      'คำตอบเรื่องการจัดส่ง Cold-chain การสมัครสมาชิก การเก็บรักษา การชำระเงิน และขายส่ง GingerBros น้ำขิงซ่าและชาขิง ผลิตในประเทศไทย',
  },
  '/shipping': {
    title: 'Delivery in Thailand: Shipping & Cold-Chain | GingerBros',
    description:
      'Delivery across Thailand for Ginger Fizz and Ginger Tea. ฿100 shipping, free over ฿500, dispatched Mon–Thu, with an optional cold-chain upgrade.',
    titleTh: 'จัดส่งทั่วไทย: ค่าส่งและ Cold-chain | GingerBros',
    descriptionTh:
      'จัดส่ง Ginger Fizz และ Ginger Tea ทั่วประเทศไทย ค่าส่ง ฿100 ฟรีเมื่อสั่งเกิน ฿500 ส่งออกวันจันทร์–พฤหัสบดี พร้อมตัวเลือก Cold-chain',
  },
  '/find-us': {
    title: 'Where to Buy GingerBros | Online, LINE, Shopee & Stockists',
    description: 'Order GingerBros online with nationwide delivery in Thailand, or find us on LINE, Shopee, at markets and at our stockists.',
  },
  '/guide': {
    title: 'Ginger Guide: Mocktails & Thai Food Pairings | GingerBros',
    description:
      'How to serve Ginger Fizz and Ginger Tea, ginger mocktails and cocktails, Thai food pairings and everything worth knowing about Thai ginger.',
  },
  '/business': {
    title: 'Wholesale Ginger Drinks for Cafés & Bars | GingerBros',
    description:
      'Wholesale ginger drinks for cafés, bars, restaurants and hotels in Thailand. Free samples, recipe cards, menu copy and trade pricing. Request a quote.',
  },
  '/returns': {
    title: 'Returns & Refund Policy | GingerBros',
    description:
      'GingerBros return policy. Damaged or incorrect orders? Contact us within 24 hours with photos for a replacement or full refund.',
  },
  '/privacy': {
    title: 'Privacy Policy | GingerBros',
    description:
      'GingerBros privacy policy: how we collect, use, and protect your personal information when you shop at gingerbrosshop.com.',
  },
  '/terms': {
    title: 'Terms of Service | GingerBros',
    description:
      'GingerBros terms of service: your rights and obligations when buying ginger drinks from gingerbrosshop.com.',
  },
  '/track': {
    title: 'Track Your Order | GingerBros',
    description: 'Track your GingerBros order status. Enter your email and order number to see shipping updates.',
    indexable: false,
  },
  '/orders': {
    title: 'My Orders | GingerBros',
    description: 'Look up your past GingerBros orders by email address.',
    indexable: false,
  },
  // Not prerendered: served from the SPA shell with edge-injected meta.
  '/order/success': {
    title: 'Thank You for Your Order | GingerBros',
    description: 'Your GingerBros order has been received.',
    indexable: false,
    prerender: false,
  },
  '/links': {
    title: 'GingerBros | Links',
    description:
      'Think Ginger. Drink Different. Shop Ginger Fizz and Ginger Tea, or find us on LINE, Grab, Shopee, Instagram, TikTok and Facebook.',
    image: `${SITE_URL}/linkpage/avatar.png`,
    prerender: false,
  },
  '/admin/login': { title: 'Admin Login | GingerBros', description: 'GingerBros admin login.', indexable: false, prerender: false },
  '/admin/links': { title: 'Admin Links | GingerBros', description: 'GingerBros link-in-bio editor.', indexable: false, prerender: false },
  '/admin/orders': {
    title: 'Admin Orders | GingerBros',
    description: 'GingerBros order management dashboard.',
    indexable: false,
    prerender: false,
  },
};

export const isIndexable = (path: string): boolean => ROUTE_SEO[path]?.indexable !== false;

/** Paths with a real Thai version (prerendered under /th, hreflang, sitemap alternates). */
export const THAI_PATHS: string[] = Object.entries(ROUTE_SEO)
  .filter(([, r]) => r.titleTh && r.descriptionTh)
  .map(([p]) => p);

/** Static routes rendered at build time. */
export const PRERENDER_PATHS: string[] = Object.entries(ROUTE_SEO)
  .filter(([, r]) => r.prerender !== false)
  .map(([p]) => p);

/** Static routes listed in sitemap.xml. */
export const SITEMAP_PATHS: string[] = Object.entries(ROUTE_SEO)
  .filter(([, r]) => r.indexable !== false && r.prerender !== false)
  .map(([p]) => p);

export interface ResolvedRouteSeo {
  title: string;
  description: string;
  image: string;
  indexable: boolean;
}

/** Meta for `path` in `locale`, falling back to English when there is no Thai copy. */
export function routeSeo(path: string, locale: 'en' | 'th' = 'en'): ResolvedRouteSeo | undefined {
  const r = ROUTE_SEO[path];
  if (!r) return undefined;
  const th = locale === 'th' && r.titleTh && r.descriptionTh;
  return {
    title: th ? (r.titleTh as string) : r.title,
    description: th ? (r.descriptionTh as string) : r.description,
    image: r.image ?? DEFAULT_OG_IMAGE,
    indexable: r.indexable !== false,
  };
}
