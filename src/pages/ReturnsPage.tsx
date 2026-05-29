import { useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle, Mail, ShieldCheck } from 'lucide-react';

export default function ReturnsPage() {
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
        <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">Returns & Refunds</h1>
        <p className="font-body text-earth text-center mb-12">Our commitment to quality and your satisfaction.</p>

        <div className="bg-cream rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-rust flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-semibold text-deep-brown text-lg mb-2">Perishable Goods Policy</h2>
              <p className="font-body text-earth leading-relaxed">
                Because ginger beer is a perishable food product, we cannot accept returns for change of mind. This is standard practice for all food and beverage businesses. However, we stand behind our product 100%.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-accent-green flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-semibold text-deep-brown text-lg mb-2">Damaged or Incorrect Orders</h2>
              <p className="font-body text-earth leading-relaxed mb-4">
                If your order arrives damaged, broken, or incorrect, we will make it right. Contact us within 24 hours of delivery with photos of the issue.
              </p>
              <ul className="space-y-2">
                {[
                  'Broken bottles during shipping',
                  'Wrong product delivered',
                  'Expired or spoiled product',
                  'Missing items from your order',
                ].map((item) => (
                  <li key={item} className="font-body text-earth flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent-green rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8 mb-8">
          <h2 className="font-display font-semibold text-deep-brown text-lg mb-4">What We Will Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Replacement', desc: 'We will send a replacement of the affected items at no cost.' },
              { title: 'Full Refund', desc: 'If a replacement is not possible, we will issue a full refund.' },
              { title: 'Store Credit', desc: 'Choose store credit for future orders if you prefer.' },
            ].map((item) => (
              <div key={item.title} className="bg-warm-white rounded-xl p-4">
                <h3 className="font-display font-semibold text-deep-brown mb-1">{item.title}</h3>
                <p className="font-body text-earth text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-rust" />
            <span className="font-body font-semibold text-deep-brown">Contact us within 24 hours</span>
          </div>
          <a href="mailto:gingerbros.brew@gmail.com" className="inline-block bg-deep-brown text-cream font-body font-medium px-8 py-3 rounded-full hover:bg-rust transition-colors">
            gingerbros.brew@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
