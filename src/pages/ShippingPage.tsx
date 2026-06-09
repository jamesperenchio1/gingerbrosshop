import { useNavigate } from 'react-router';
import { ArrowLeft, Truck, Clock, MapPin, PackageCheck } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ShippingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Shipping Information — Nationwide Delivery in Thailand | GingerBros"
        description="GingerBros ships nationwide across Thailand. Free shipping on orders over ฿500. Delivery in 2–4 business days. Cold-chain available for unpasteurized ginger beer."
        path="/shipping"
      />
      <div className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-xl border-b border-soft-peach/50">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-body font-medium text-sm text-earth hover:text-deep-brown transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>
          <span className="font-display font-bold text-lg text-deep-brown">GingerBros</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-16">
        <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">Shipping & Delivery</h1>
        <p className="font-body text-earth text-center mb-12">Fast, reliable delivery across Thailand.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over ฿500' },
            { icon: Clock, title: '2–4 Days', desc: 'Nationwide delivery' },
            { icon: PackageCheck, title: 'Tracked', desc: 'Tracking number provided' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-cream rounded-2xl p-6 text-center">
                <Icon className="w-8 h-8 text-rust mx-auto mb-3" />
                <h3 className="font-display font-semibold text-deep-brown mb-1">{item.title}</h3>
                <p className="font-body text-earth text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-cream rounded-2xl p-8 mb-8">
          <h2 className="font-display font-semibold text-deep-brown text-xl mb-4">Shipping Rates</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-soft-peach/50">
              <span className="font-body text-earth">Orders under ฿500</span>
              <span className="font-body font-semibold text-deep-brown">฿50 flat rate</span>
            </div>
            <div className="flex justify-between py-3 border-b border-soft-peach/50">
              <span className="font-body text-earth">Orders ฿500 and over</span>
              <span className="font-body font-semibold text-accent-green">FREE</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-body text-earth">Subscription orders</span>
              <span className="font-body font-semibold text-accent-green">FREE</span>
            </div>
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8 mb-8">
          <h2 className="font-display font-semibold text-deep-brown text-xl mb-4">Delivery Times</h2>
          <div className="space-y-3">
            {[
              { region: 'Bangkok & Metro', time: '1–2 business days' },
              { region: 'Central Thailand', time: '2–3 business days' },
              { region: 'Northern Thailand', time: '3–4 business days' },
              { region: 'Southern Thailand', time: '3–5 business days' },
              { region: 'Northeastern Thailand', time: '3–5 business days' },
            ].map((r) => (
              <div key={r.region} className="flex justify-between py-3 border-b border-soft-peach/50 last:border-0">
                <span className="font-body text-earth">{r.region}</span>
                <span className="font-body font-medium text-deep-brown">{r.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-rust flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-semibold text-deep-brown mb-2">Unpasteurized — Grab Only</h3>
              <p className="font-body text-earth leading-relaxed">
                Our unpasteurized ginger beer requires refrigeration and is currently only available via Grab within Bangkok and surrounding areas. We are working on cold-chain delivery for nationwide unpasteurized shipping.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
