import Shop from '@/sections/Shop';
import SEO from '@/components/SEO';
import { useCatalog } from '@/lib/catalog';
import { SITE_URL } from '@/constants/site';

export default function ShopPage() {
  const { products } = useCatalog();
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Shop GingerBros',
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/product/${p.id}`, name: p.name })),
  };
  return (
    <>
      <SEO
        route="/shop"
        jsonLd={[itemList, {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
          ],
        }]}
      />
      <Shop variant="page" />
    </>
  );
}
