import { MapPin, Truck, Thermometer, Box } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ShippingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Shipping Information — GingerBros',
    description: 'Nationwide shipping for GingerBros ginger fizz. Standard delivery across Thailand with an optional cold-chain upgrade.',
    url: 'https://gingerbrosshop.com/shipping',
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Shipping Information — GingerBros"
        description="Nationwide shipping for GingerBros ginger fizz. Standard delivery across Thailand with an optional cold-chain upgrade."
        path="/shipping"
        jsonLd={jsonLd}
      />
      <main className="pt-28 pb-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-body font-medium text-[13px] uppercase tracking-[0.08em] text-rust mb-3 block">
              DELIVERY
            </span>
            <h1 className="font-display font-bold text-deep-brown text-[clamp(2rem,4vw,3rem)] mb-4">
              Shipping Information
            </h1>
            <p className="font-body text-earth text-lg max-w-[600px] mx-auto leading-relaxed">
              Fresh ginger fizz delivered to your door across Thailand. Standard shipping is free over ฿500, or upgrade to cold-chain delivery for extra peace of mind.
            </p>
          </div>

          {/* Delivery Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-cream rounded-2xl p-8">
              <Truck className="w-8 h-8 text-amber mb-4" />
              <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-3">
                Standard Nationwide Shipping
              </h3>
              <p className="font-body text-[14px] text-earth leading-relaxed mb-4">
                Standard delivery is the default for every order. We pack bottles securely and dispatch Monday–Thursday so your fizz reaches you quickly and in great shape. Reliable, trackable, and hassle-free.
              </p>
              <div className="border-t border-deep-brown/10 pt-4">
                <p className="font-body text-[14px] text-deep-brown font-semibold mb-1">
                  Flat ฿100 shipping · FREE on orders over ฿500
                </p>
                <p className="font-body text-[14px] text-earth leading-relaxed">
                  One simple rate covers standard courier delivery anywhere in Thailand. You will get a tracking link once your order is on the way.
                </p>
              </div>
              <div className="mt-4 flex items-start gap-2 text-[13px] text-earth">
                <MapPin className="w-4 h-4 text-grab-green flex-shrink-0 mt-0.5" />
                <span>
                  Near us in Bangkok or Pathum Thani? Same-day local delivery via Grab or Lineman is available on request.
                </span>
              </div>
            </div>

            <div className="bg-cream rounded-2xl p-8">
              <Thermometer className="w-8 h-8 text-rust mb-4" />
              <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-3">
                Optional Cold-Chain Upgrade
              </h3>
              <p className="font-body text-[14px] text-earth leading-relaxed mb-4">
                Want extra protection? Choose cold-chain delivery at checkout and your order travels in an insulated box with ice packs. A good option for hot days or longer transit routes.
              </p>
              <div className="border-t border-deep-brown/10 pt-4">
                <p className="font-body text-[14px] text-deep-brown font-semibold mb-1">
                  +฿100 cold-chain upgrade
                </p>
                <p className="font-body text-[14px] text-earth leading-relaxed">
                  Simply select the cold-chain shipping option during checkout. You still get tracking and the same dispatch schedule.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-cream rounded-2xl p-8 mb-12">
            <h2 className="font-display font-semibold text-deep-brown text-[1.35rem] mb-6">
              What to Expect
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Order packed', desc: 'We carefully pack your bottles so they travel safely.' },
                { title: 'Courier pickup', desc: 'Dispatched Monday–Thursday with a tracking link sent by email.' },
                { title: 'Arrives ready', desc: 'Refrigerate on arrival. Best enjoyed within 30 days of bottling.' },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber text-deep-brown font-display font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-deep-brown mb-1">{step.title}</h4>
                    <p className="font-body text-[14px] text-earth">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packaging Note */}
          <div className="flex items-start gap-4 bg-deep-brown rounded-2xl p-8 text-cream">
            <Box className="w-8 h-8 text-amber flex-shrink-0" />
            <div>
              <h3 className="font-display font-semibold text-[1.1rem] mb-2">Packaging Guarantee</h3>
              <p className="font-body text-[14px] text-cream/80 leading-relaxed">
                Every order is sealed and protected for transit. If your order arrives damaged, contact us within 24 hours and we will make it right.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
