import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import Shop from '@/sections/Shop';
import Story from '@/sections/Story';
import Process from '@/sections/Process';
import Benefits from '@/sections/Benefits';
import Newsletter from '@/components/Newsletter';
import LineWidget from '@/components/LineWidget';
import Footer from '@/sections/Footer';
import CartDrawer from '@/sections/CartDrawer';
import SEO from '@/components/SEO';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GingerBros',
  url: 'https://gingerbrosshop.com',
  logo: 'https://gingerbrosshop.com/images/product-unpasteurized-2.jpg',
  sameAs: [
    'https://www.instagram.com/drinkgingerbros',
    'https://www.tiktok.com/@gingerbrosbrew',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Thai'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GingerBros',
  url: 'https://gingerbrosshop.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://gingerbrosshop.com/blog?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const productListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'GingerBros Craft Ginger Beer Products',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      url: 'https://gingerbrosshop.com/product/unpasteurized',
      name: 'Unpasteurized Ginger Beer',
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="GingerBros — Naturally Brewed Craft Ginger Beer from Thailand"
        description="7-day naturally fermented craft ginger beer brewed in Thailand. Raw, unpasteurized, and delivered chilled to your door nationwide."
        path="/"
        jsonLd={[organizationSchema, websiteSchema, productListSchema]}
      />
      <Navigation />
      <Hero />
      <Shop />
      <Story />
      <Process />
      <Benefits />
      <Newsletter />
      <Footer />
      <CartDrawer />
      <LineWidget />
    </div>
  );
}
