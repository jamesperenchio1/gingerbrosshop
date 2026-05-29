import { useNavigate } from 'react-router';
import { ArrowLeft, Store, Truck, Percent, MessageCircle } from 'lucide-react';

export default function WholesalePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-warm-white">
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
        <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">Wholesale & B2B</h1>
        <p className="font-body text-earth text-center mb-12">Serve GingerBros at your cafe, bar, or restaurant.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Store, title: 'Cafes & Restaurants', desc: 'Stock our pasteurized ginger beer for your beverage menu.' },
            { icon: Truck, title: 'Bulk Delivery', desc: 'Case quantities delivered directly to your business.' },
            { icon: Percent, title: 'Wholesale Pricing', desc: 'Competitive margins for resellers and distributors.' },
            { icon: MessageCircle, title: 'Dedicated Support', desc: 'Direct line to our team for orders and questions.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-cream rounded-2xl p-6">
                <Icon className="w-8 h-8 text-rust mb-3" />
                <h3 className="font-display font-semibold text-deep-brown mb-1">{item.title}</h3>
                <p className="font-body text-earth text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-cream rounded-2xl p-8 mb-8">
          <h2 className="font-display font-semibold text-deep-brown text-xl mb-4">Minimum Order Quantities</h2>
          <div className="space-y-3">
            {[
              { product: 'Pasteurized Single Bottles', moq: '24 bottles (1 case)' },
              { product: '6-Pack Bundles', moq: '10 bundles (60 bottles)' },
            ].map((row) => (
              <div key={row.product} className="flex justify-between py-3 border-b border-soft-peach/50 last:border-0">
                <span className="font-body text-earth">{row.product}</span>
                <span className="font-body font-semibold text-deep-brown">{row.moq}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-deep-brown rounded-2xl p-8 text-center">
          <h2 className="font-display font-bold text-cream text-xl mb-3">Get a Quote</h2>
          <p className="font-body text-cream/70 mb-6">
            Tell us about your business and we will send you wholesale pricing within 24 hours.
          </p>
          <a
            href="mailto:gingerbros.brew@gmail.com?subject=Wholesale%20Inquiry"
            className="inline-block bg-amber text-deep-brown font-body font-medium px-8 py-3 rounded-full hover:bg-warm-gold transition-colors"
          >
            Email Us — gingerbros.brew@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
