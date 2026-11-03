import { Link } from 'react-router';
import SEO from '@/components/SEO';
import { SITE_URL } from '@/constants/site';

const CHANNELS = [
  { name: 'gingerbrosshop.com', desc: 'The full range, every pack size and the best deals. Delivered across Thailand, with a cold-chain option.', href: '/shop', cta: 'Shop online', internal: true },
  { name: 'LINE', desc: 'Order, ask questions or check on a delivery. Add us and say hi.', href: 'https://line.me/R/ti/p/@852nqred', cta: 'Add @852nqred' },
  { name: 'Shopee', desc: 'Prefer to shop on Shopee? Find the GingerBros store there.', href: 'https://shopee.co.th/gingerbros', cta: 'Open Shopee' },
  { name: 'Instagram & TikTok', desc: 'Pop-ups, markets and where we are this week: we post it first on socials.', href: 'https://www.instagram.com/drinkgingerbros', cta: 'Follow @drinkgingerbros' },
];

export default function FindUsPage() {
  return (
    <>
      <SEO
        title="Where to Buy GingerBros | Online, LINE, Shopee & Stockists"
        description="Order GingerBros online with nationwide delivery in Thailand, or find us on LINE, Shopee, at markets and at our stockists."
        path="/find-us"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Find GingerBros', url: `${SITE_URL}/find-us` }}
      />
      <section className="bg-warm-white pb-20 pt-32 md:pt-40">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <span className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-rust">Find us</span>
          <h1 className="font-poster mt-3 text-[clamp(2.8rem,8vw,6.5rem)] text-deep-brown">Get your hands on a bottle.</h1>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {CHANNELS.map((c) => (
              <li key={c.name} className="flex flex-col rounded-[24px] border border-soft-peach bg-white p-7 shadow-panel">
                <h2 className="font-display text-[1.5rem] font-bold text-deep-brown">{c.name}</h2>
                <p className="mt-2 flex-grow font-body text-[15px] text-earth">{c.desc}</p>
                {c.internal ? (
                  <Link to={c.href} className="mt-5 self-start rounded-full bg-charcoal px-6 py-3 font-body text-[13px] font-bold uppercase tracking-[0.08em] text-cream hover:bg-deep-brown">{c.cta} →</Link>
                ) : (
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="mt-5 self-start rounded-full bg-charcoal px-6 py-3 font-body text-[13px] font-bold uppercase tracking-[0.08em] text-cream hover:bg-deep-brown">{c.cta} ↗</a>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-12 rounded-[28px] bg-ginger p-8 md:p-10">
            <h2 className="font-poster text-[clamp(2rem,5vw,3.5rem)] text-charcoal">Want GingerBros at your café?</h2>
            <p className="mt-3 max-w-[560px] font-body text-[16px] text-charcoal">We&apos;re looking for cafés, bars, restaurants and shops to stock us. Samples are on us.</p>
            <Link to="/business" className="mt-6 inline-block rounded-full bg-charcoal px-7 py-3.5 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-cream hover:bg-deep-brown">Become a stockist →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
