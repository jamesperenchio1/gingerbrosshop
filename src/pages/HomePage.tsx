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
import { SITE_URL } from '@/constants/site';
import { siteGraph } from '@/seo/schema';
import { useI18n } from '@/context/I18nContext';

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
      <SEO route="/" jsonLd={[siteGraph(), productListSchema, faqSchema]} />
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
