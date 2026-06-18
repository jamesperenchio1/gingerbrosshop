import { MapPin, Truck, Clock, Box } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ShippingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Shipping Information — GingerBros',
    description: 'Shipping rates and delivery information for GingerBros unpasteurized ginger fizz. Chilled nationwide delivery across Thailand.',
    url: 'https://gingerbrosshop.com/shipping',
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Shipping Information — GingerBros"
        description="Shipping rates and delivery information for GingerBros unpasteurized ginger fizz. Chilled nationwide delivery across Thailand."
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
              Fresh ginger fizz shipped chilled to your door across Thailand.
            </p>
          </div>

          {/* Delivery Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-cream rounded-2xl p-8">
              <Truck className="w-8 h-8 text-amber mb-4" />
              <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-3">
                Chilled Nationwide Shipping
              </h3>
              <p className="font-body text-[14px] text-earth leading-relaxed mb-4">
                Our ginger fizz is unpasteurized and full of living cultures, so it has to stay cold from our fridge to yours. Every order travels in an insulated foam box packed with ice packs to lock in flavor and keep those cultures happy in transit. We pack fresh Monday–Thursday and dispatch the same or next business day so your bottles spend as little time on the road as possible.
              </p>
              <div className="border-t border-deep-brown/10 pt-4">
                <p className="font-body text-[14px] text-deep-brown font-semibold mb-1">
                  Flat ฿100 chilled shipping
                </p>
                <p className="font-body text-[14px] text-earth leading-relaxed">
                  One simple rate covers your insulated packaging, ice packs, and cold-chain courier anywhere in Thailand — and it's <strong className="text-deep-brown">FREE on orders over ฿500</strong>. Exact transit time depends on the courier and your destination, and you'll get a tracking link once you're on the way.
                </p>
              </div>
              <div className="mt-4 flex items-start gap-2 text-[13px] text-earth">
                <MapPin className="w-4 h-4 text-grab-green flex-shrink-0 mt-0.5" />
                <span>
                  Near us in Bangkok or Pathum Thani? We can deliver same-day chilled via Grab or Lineman — just reach out.
                </span>
              </div>
            </div>

            <div className="bg-cream rounded-2xl p-8">
              <MapPin className="w-8 h-8 text-grab-green mb-4" />
              <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-3">
                Unpasteurized — Chilled Nationwide
              </h3>
              <p className="font-body text-[14px] text-earth leading-relaxed mb-4">
                Our unpasteurized ginger fizz is a raw, living product. It is packed in insulated boxes with ice packs and shipped via chilled courier across Thailand. Please refrigerate immediately on arrival.
              </p>
              <div className="flex items-center gap-2 text-[13px] text-earth">
                <Clock className="w-4 h-4 text-rust" />
                <span>Available for online purchase and nationwide delivery</span>
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
                { title: 'Order packed', desc: 'We prepare your insulated foam box with ice packs to keep the cultures cold.' },
                { title: 'Courier pickup', desc: 'Dispatched Monday–Thursday via our cold-chain courier, with a tracking link by email.' },
                { title: 'Arrives cold', desc: 'Refrigerate immediately. Best enjoyed within 30 days of bottling.' },
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
                Every unpasteurized order is sealed in an insulated liner with ice packs and a "Keep Refrigerated" label. If your order arrives warm or damaged, contact us within 24 hours and we will make it right.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
