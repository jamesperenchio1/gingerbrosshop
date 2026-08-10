import { MapPin, Truck, Thermometer, Box, Clock, ShieldCheck, Phone } from 'lucide-react';
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

          {/* Transit Times */}
          <div className="bg-cream rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-rust" />
              <h2 className="font-display font-semibold text-deep-brown text-[1.35rem]">
                Estimated Transit Times
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { region: 'Bangkok & Metro', time: '1–2 business days' },
                { region: 'Pathum Thani / Rangsit', time: '1–2 business days' },
                { region: 'Chiang Mai / Phuket / Korat', time: '2–4 business days' },
                { region: 'Other provinces', time: '3–5 business days' },
              ].map((row) => (
                <div key={row.region} className="flex items-center justify-between bg-warm-white rounded-xl px-4 py-3">
                  <span className="font-body text-deep-brown text-[14px]">{row.region}</span>
                  <span className="font-body font-semibold text-rust text-[14px]">{row.time}</span>
                </div>
              ))}
            </div>
            <p className="font-body text-[13px] text-earth/70 mt-4">
              Transit times are estimates and may vary during holidays or peak periods. Remote areas may take an additional 1–2 days.
            </p>
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

          {/* Packaging + Damage Guarantee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="flex items-start gap-4 bg-deep-brown rounded-2xl p-8 text-cream">
              <Box className="w-8 h-8 text-amber flex-shrink-0" />
              <div>
                <h3 className="font-display font-semibold text-[1.1rem] mb-2">Packaging Guarantee</h3>
                <p className="font-body text-[14px] text-cream/80 leading-relaxed">
                  Every order is sealed and protected for transit. If your order arrives damaged, contact us within 24 hours and we will make it right.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-cream rounded-2xl p-8">
              <ShieldCheck className="w-8 h-8 text-accent-green flex-shrink-0" />
              <div>
                <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-2">Delivery Guarantee</h3>
                <p className="font-body text-[14px] text-earth leading-relaxed">
                  If your order is lost in transit or significantly delayed beyond our estimates, we will reship or refund at no extra cost.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-warm-white border-2 border-cream rounded-2xl p-8 text-center">
            <Phone className="w-8 h-8 text-rust mx-auto mb-4" />
            <h3 className="font-display font-semibold text-deep-brown text-[1.1rem] mb-2">
              Need Help With Delivery?
            </h3>
            <p className="font-body text-earth text-[14px] max-w-[480px] mx-auto mb-4">
              Have a special delivery request, need same-day local delivery, or have questions about your shipment? We are here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:0945285166"
                className="inline-flex items-center gap-2 bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-7 py-3 rounded-full hover:bg-warm-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                094-528-5166
              </a>
              <a
                href="https://lin.ee/qRnVI6E"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#06C755] text-white font-body font-medium text-sm uppercase tracking-[0.08em] px-7 py-3 rounded-full hover:bg-[#05b34d] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.3c-.3.85-1.5 1.55-2.73 1.74-.73.11-1.46.08-2.16-.06-.5-.1-1.1-.28-1.88-.57-.38-.14-.85-.34-1.39-.6-.72-.34-1.16-.6-1.45-.84-.55-.44-.52-.92.1-1.15.36-.13.84-.15 1.28-.05.16.04.32.1.46.17l.18.09c.37.19.74.4 1.08.63.6.4 1.1.73 1.5.97.5.3.9.48 1.22.55.33.07.56-.01.7-.23.13-.21.17-.48.11-.8-.06-.33-.2-.7-.43-1.1-.23-.4-.53-.82-.9-1.26-.37-.44-.8-.88-1.3-1.32-.5-.44-1.04-.83-1.63-1.17-.58-.34-1.18-.6-1.8-.77-.62-.17-1.2-.22-1.74-.15-.54.07-.97.27-1.3.6-.33.33-.54.75-.63 1.26-.1.51-.06 1.08.1 1.7.17.62.46 1.25.88 1.88.42.63.95 1.22 1.6 1.76.65.54 1.4 1 2.26 1.38.86.38 1.78.63 2.76.74.98.11 1.94.06 2.88-.15.94-.21 1.78-.56 2.52-1.05.74-.49 1.3-1.08 1.68-1.77.38-.69.53-1.42.45-2.2-.08-.78-.35-1.55-.8-2.3z"/></svg>
                Line
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
