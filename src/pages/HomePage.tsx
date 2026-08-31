import Hero from '@/sections/Hero';
import Shop from '@/sections/Shop';
import Story from '@/sections/Story';
import Process from '@/sections/Process';
import Benefits from '@/sections/Benefits';
import Newsletter from '@/components/Newsletter';
import LineWidget from '@/components/LineWidget';
import Footer from '@/sections/Footer';
import SEO from '@/components/SEO';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, SOCIAL_LINKS } from '@/constants/site';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  sameAs: SOCIAL_LINKS,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Thai'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const productListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'GingerBros Craft Ginger Fizz Products',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      url: `${SITE_URL}/product/ginger-fizz`,
      name: `${SITE_NAME} Ginger Fizz`,
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="GingerBros — Naturally Brewed Craft Ginger Fizz from Thailand"
        description="Naturally fermented craft ginger fizz brewed in Thailand. Real ginger, prebiotic acacia fibre, low in sugar, delivered to your door nationwide."
        path="/"
        jsonLd={[organizationSchema, websiteSchema, productListSchema]}
      />
      <Hero />
      <Shop />
      <Story />
      <Process />
      <Benefits />
      <Newsletter />
      <Footer />
      <LineWidget />
    </div>
  );
}
