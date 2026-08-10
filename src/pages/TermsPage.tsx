import { useNavigate } from 'react-router';
import { ArrowLeft, FileText, Package, Truck, RotateCcw, CreditCard, Scale, Copyright, AlertTriangle, Gavel, Mail, Lock, UserX } from 'lucide-react';
import SEO from '@/components/SEO';

export default function TermsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <FileText className="w-6 h-6 text-amber" />,
      title: 'Acceptance of Terms',
      content: `By accessing gingerbrosshop.com and placing an order with GingerBros, you confirm that you are at least 18 years of age or have the consent of a parent or guardian, and that you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website or services.

We reserve the right to update or modify these terms at any time without prior notice. Your continued use of the website following any changes constitutes acceptance of those changes.`
    },
    {
      icon: <Package className="w-6 h-6 text-amber" />,
      title: 'Products & Availability',
      content: `All products are subject to availability. We reserve the right to discontinue any product, limit quantities, or refuse any order at our sole discretion. Product descriptions, images, and prices are displayed as accurately as possible, but we do not guarantee that all details are error-free.

GingerBros ginger fizz is a fresh, naturally fermented, perishable beverage. Because we do not pasteurise or use preservatives, shelf life is limited. Each bottle displays a "bottled on" date. We recommend consumption within 30 days of bottling when stored refrigerated at 2–6°C.`
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber" />,
      title: 'Orders & Pricing',
      content: `All prices are listed in Thai Baht (THB) and include applicable VAT where required. Shipping costs are calculated at checkout based on your selected delivery method. We reserve the right to correct pricing errors before accepting an order.

Payment is processed securely through Stripe. We accept credit/debit cards and PromptPay. Your order is only confirmed once payment has been successfully received and you have received an order confirmation email.`
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-amber" />,
      title: 'Returns, Refunds & Damages',
      content: `Due to the perishable nature of our product, we do not accept returns on opened or consumed bottles.

However, if your order arrives damaged, spoiled, incorrect, or missing items, please contact us within 24 hours of delivery with photos and your order number. We will assess the issue and, at our discretion, offer a replacement, store credit, or full refund.

We may require proof of damage (photos) before processing a refund or replacement. Refunds are issued to the original payment method and typically processed within 5–10 business days.`
    },
    {
      icon: <Truck className="w-6 h-6 text-amber" />,
      title: 'Shipping & Delivery',
      content: `We ship across Thailand via standard courier, with an optional cold-chain upgrade available at checkout. Standard shipping is ฿100 flat rate, free on orders over ฿500.

Orders are dispatched Monday–Thursday. Estimated transit times are:
• Bangkok & surrounding areas: 1–2 business days
• Major cities (Chiang Mai, Phuket, Korat): 2–4 business days
• Other provinces: 3–5 business days

Risk of loss and title for items pass to you upon delivery to the courier. We are not responsible for delays caused by the courier, incorrect addresses provided by you, or circumstances beyond our control (weather, holidays, etc.).`
    },
    {
      icon: <FileText className="w-6 h-6 text-amber" />,
      title: 'Subscriptions',
      content: `Subscription billing recurs automatically at your chosen interval (weekly, every 2 weeks, or monthly). By subscribing, you authorise us to charge your payment method on each billing date until you cancel.

You may pause, skip, or cancel your subscription at any time through your customer portal — no cancellation fees, no minimum commitment. Cancellations must be made before the next billing date to avoid being charged for that cycle.

Subscription pricing is locked at the rate you signed up for, subject to our right to adjust prices with reasonable notice.`
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-amber" />,
      title: 'Product Safety & Allergens',
      content: `GingerBros ginger fizz contains: fresh ginger, water, erythritol, white sugar (fermentation starter), ginger bug culture, acacia fibre (prebiotic), and fresh lime. It is naturally fermented and contains trace alcohol (typically less than 0.5% ABV). It is not suitable for individuals with severe allergies to any of these ingredients.

Our products are manufactured in a facility that may handle other allergens. While we take precautions, we cannot guarantee complete absence of cross-contamination. If you have specific dietary concerns, please contact us before ordering.`
    },
    {
      icon: <Copyright className="w-6 h-6 text-amber" />,
      title: 'Intellectual Property',
      content: `All content on this website — including text, graphics, logos, images, product names, recipes, and design — is the property of GingerBros or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.`
    },
    {
      icon: <Scale className="w-6 h-6 text-amber" />,
      title: 'Limitation of Liability',
      content: `To the fullest extent permitted by law, GingerBros shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our website or products, even if we have been advised of the possibility of such damages.

Our total liability to you for any claim arising from your purchase shall not exceed the amount you paid for the specific product giving rise to the claim.`
    },
    {
      icon: <Gavel className="w-6 h-6 text-amber" />,
      title: 'Governing Law & Disputes',
      content: `These Terms of Service shall be governed by and construed in accordance with the laws of the Kingdom of Thailand. Any dispute arising out of or in connection with these terms shall first be attempted to be resolved through good faith negotiation. If negotiation fails, the dispute shall be submitted to the exclusive jurisdiction of the courts of Bangkok, Thailand.`
    },
    {
      icon: <Lock className="w-6 h-6 text-amber" />,
      title: 'Account & Portal Access',
      content: `Your customer portal is accessed via a secure link sent to your email at checkout. You are responsible for maintaining the confidentiality of this link. Do not share it with others. If you believe your portal access has been compromised, contact us immediately.`
    },
    {
      icon: <UserX className="w-6 h-6 text-amber" />,
      title: 'Prohibited Uses',
      content: `You may not use our website or services for any unlawful purpose. Prohibited activities include:

• Attempting to interfere with the proper functioning of the website
• Using automated systems to access or scrape our website without permission
• Submitting false or misleading information during checkout
• Reselling our products without prior written authorisation`
    },
  ];

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Terms of Service | GingerBros"
        description="GingerBros terms of service — your rights and obligations when purchasing craft ginger fizz from gingerbrosshop.com."
        path="/terms"
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
        <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">Terms of Service</h1>
        <p className="font-body text-earth text-center mb-12">Last updated: August 2025</p>

        <p className="font-body text-earth leading-relaxed mb-10 text-center max-w-[600px] mx-auto">
          These terms govern your use of the GingerBros website and the purchase of our products. Please read them carefully before placing an order.
        </p>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-cream rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h2 className="font-display font-semibold text-deep-brown text-lg">{section.title}</h2>
              </div>
              <div className="font-body text-earth leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-deep-brown rounded-2xl p-8 text-cream text-center">
          <h3 className="font-display font-semibold text-[1.1rem] mb-2">Questions about our terms?</h3>
          <p className="font-body text-cream/80 text-[14px] mb-4 max-w-[480px] mx-auto">
            If anything is unclear or you need clarification on any of these terms, we are happy to help.
          </p>
          <a
            href="mailto:gingerbros.brew@gmail.com"
            className="inline-flex items-center gap-2 bg-amber text-deep-brown font-body font-medium text-sm uppercase tracking-[0.08em] px-7 py-3 rounded-full hover:bg-warm-gold transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
