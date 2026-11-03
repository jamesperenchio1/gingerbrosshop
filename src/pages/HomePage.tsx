import { useEffect } from 'react';
import Hero from '@/sections/Hero';
import Ticker from '@/sections/home/Ticker';
import Shop from '@/sections/Shop';
import Compare from '@/sections/home/Compare';
import HomeFaq from '@/sections/home/HomeFaq';
import Manifesto from '@/sections/home/Manifesto';
import { HOME_FAQ } from '@/lib/homeContent';
import GingerWay from '@/sections/home/GingerWay';
import BusinessTeaser from '@/sections/home/BusinessTeaser';
import Newsletter from '@/components/Newsletter';
import LineWidget from '@/components/LineWidget';
import SEO from '@/components/SEO';
import { prefetchProductDetailWhenIdle } from '@/lib/prefetch';
import { useCatalog } from '@/lib/catalog';
import { SITE_URL, SITE_NAME, SOCIAL_LINKS, LOGO_URL } from '@/constants/site';
import { useI18n } from '@/context/I18nContext';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  slogan: 'Think Ginger. Drink Different.',
  description: 'GingerBros makes modern ginger drinks in Thailand: Ginger Fizz and Ginger Tea, made with fresh Thai ginger.',
  sameAs: SOCIAL_LINKS,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'gingerbros.brew@gmail.com',
    availableLanguage: ['English', 'Thai'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: ['Ginger Bros', 'จินเจอร์บรอส'],
  url: SITE_URL,
  inLanguage: ['en', 'th'],
};

export default function HomePage() {
  useEffect(() => prefetchProductDetailWhenIdle(), []);
  const { products } = useCatalog();
  const { locale } = useI18n();
  const drinks = products.filter((p) => p.category === 'drinks');
  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'GingerBros ginger drinks',
    itemListElement: drinks.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/product/${p.id}`,
      name: p.name,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ[locale].map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title={locale === 'th'
          ? 'GingerBros | น้ำขิงซ่า & ชาขิง เครื่องดื่มขิงยุคใหม่ ผลิตในไทย'
          : 'GingerBros | Ginger Fizz & Ginger Tea from Thailand'}
        description={locale === 'th'
          ? 'คิดแบบขิง ดื่มให้แตกต่าง น้ำขิงซ่าและชาขิงจากขิงไทยสด มะนาวแท้ หวานน้อย สั่งออนไลน์ส่งทั่วไทย'
          : 'Modern ginger drinks made in Thailand. Ginger Fizz and Ginger Tea with fresh Thai ginger, real lime and low sugar. Order online, delivered nationwide.'}
        path="/"
        jsonLd={[organizationSchema, websiteSchema, productListSchema, faqSchema]}
      />
      <Hero />
      <Ticker />
      <Shop variant="home" />
      <Compare />
      <Manifesto />
      <GingerWay />
      <HomeFaq />
      <BusinessTeaser />
      <Newsletter />
      <LineWidget />
    </div>
  );
}
