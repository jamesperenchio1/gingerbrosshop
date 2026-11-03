import Shop from '@/sections/Shop';
import SEO from '@/components/SEO';
import { useI18n } from '@/context/I18nContext';
import { useCatalog } from '@/lib/catalog';
import { SITE_URL } from '@/constants/site';

export default function ShopPage() {
  const { locale } = useI18n();
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
        title={locale === 'th'
          ? 'ช้อปน้ำขิงซ่า ชาขิง และแพ็กสุดคุ้ม | GingerBros'
          : 'Shop Ginger Fizz, Ginger Tea & Multi-Buy Packs | GingerBros'}
        description={locale === 'th'
          ? 'สั่งน้ำขิงซ่าและชาขิงออนไลน์ ส่งทั่วไทย ขวดเดี่ยว แพ็ก 2, 3 และ 6 ขวด ผสมได้ตามใจ ส่วนลดคิดอัตโนมัติ'
          : 'Buy Ginger Fizz and Ginger Tea online in Thailand. Singles, 2, 3 and 6-packs, mix-and-match bundles and subscriptions. Deals apply automatically.'}
        path="/shop"
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
