import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
        <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">Privacy Policy</h1>
        <p className="font-body text-earth text-center mb-12">Last updated: May 2025</p>

        <div className="prose prose-stone max-w-none">
          <div className="bg-cream rounded-2xl p-8 mb-6">
            <h2 className="font-display font-semibold text-deep-brown text-lg mb-3">Information We Collect</h2>
            <p className="font-body text-earth leading-relaxed mb-3">
              We collect information you provide directly to us when you place an order, subscribe to our newsletter, or contact us. This includes your name, email address, phone number, shipping address, and payment information.
            </p>
            <p className="font-body text-earth leading-relaxed">
              We also automatically collect certain information about your device and how you interact with our website, including your IP address, browser type, and pages visited.
            </p>
          </div>

          <div className="bg-cream rounded-2xl p-8 mb-6">
            <h2 className="font-display font-semibold text-deep-brown text-lg mb-3">How We Use Your Information</h2>
            <ul className="space-y-2">
              {[
                'Process and fulfill your orders',
                'Send order confirmations and shipping updates',
                'Provide customer support',
                'Send marketing communications (with your consent)',
                'Improve our website and products',
              ].map((item) => (
                <li key={item} className="font-body text-earth flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-green rounded-full flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-cream rounded-2xl p-8 mb-6">
            <h2 className="font-display font-semibold text-deep-brown text-lg mb-3">Payment Security</h2>
            <p className="font-body text-earth leading-relaxed">
              All payments are processed securely through Stripe. We do not store your credit card details on our servers. Stripe is PCI DSS Level 1 certified, the highest level of security certification in the payments industry.
            </p>
          </div>

          <div className="bg-cream rounded-2xl p-8 mb-6">
            <h2 className="font-display font-semibold text-deep-brown text-lg mb-3">Cookies</h2>
            <p className="font-body text-earth leading-relaxed">
              We use cookies to remember your cart contents, language preference, and to analyze website traffic. You can disable cookies in your browser settings, but this may affect your shopping experience.
            </p>
          </div>

          <div className="bg-cream rounded-2xl p-8">
            <h2 className="font-display font-semibold text-deep-brown text-lg mb-3">Contact Us</h2>
            <p className="font-body text-earth leading-relaxed">
              If you have any questions about this privacy policy, please contact us at{' '}
              <a href="mailto:gingerbros.brew@gmail.com" className="text-rust hover:underline">gingerbros.brew@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
