import { useNavigate } from 'react-router';
import {
  ArrowLeft, Shield, Cookie, CreditCard, Mail, Eye, Lock,
  UserCheck, Baby, Globe, AlertTriangle, FileKey, Server, Phone,
  HardDrive, FileText, Scale
} from 'lucide-react';
import SEO from '@/components/SEO';

export default function PrivacyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Eye className="w-6 h-6 text-amber" />,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us when you place an order, subscribe to our newsletter, submit a wholesale inquiry, or contact us. This includes:

• Name, email address, and phone number
• Shipping and billing addresses
• Payment information (processed securely through Stripe — we never see your full card details)
• Order history and preferences
• Any notes or messages you include with your order

We also automatically collect certain technical information when you visit our website, including your IP address, browser type, device information, pages visited, and referring URL. This helps us understand how people use our site and improve the experience.`,
    },
    {
      icon: <Shield className="w-6 h-6 text-amber" />,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:

• Process, fulfil, and ship your orders
• Send order confirmations, shipping updates, and delivery notifications
• Provide customer support and respond to inquiries
• Send marketing communications like restock alerts and offers (only with your consent)
• Prevent fraud and maintain the security of our website
• Improve our products, website, and customer experience
• Comply with legal obligations

We do not sell, rent, or trade your personal information to third parties for marketing purposes.`,
    },
    {
      icon: <Scale className="w-6 h-6 text-amber" />,
      title: 'Legal Basis for Processing (GDPR)',
      content: `If you are located in the European Economic Area (EEA), our legal basis for collecting and using your personal information depends on the information we collect and the specific context in which we collect it. We process your personal data because:

• We need to perform a contract with you (e.g., to fulfil your order)
• You have given us permission to do so (e.g., newsletter subscription)
• The processing is in our legitimate interests and is not overridden by your rights
• We need to comply with the law`,
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber" />,
      title: 'Payment Security',
      content: `All payments are processed securely through Stripe, a PCI DSS Level 1 certified payment processor. We do not store your credit card details on our servers. When you enter your card information, it is encrypted and sent directly to Stripe. We only retain a tokenised reference that allows us to process refunds or subscription renewals if needed.`,
    },
    {
      icon: <Lock className="w-6 h-6 text-amber" />,
      title: 'How We Protect Your Data',
      content: `We take reasonable measures to protect your personal information from unauthorised access, disclosure, or destruction. This includes:

• SSL/TLS encryption for all data transmitted between your browser and our servers
• Secure hosting on Vercel with industry-standard security practices
• Access controls limiting who can view customer data
• Regular security reviews and dependency updates

While we take these precautions, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.`,
    },
    {
      icon: <Server className="w-6 h-6 text-amber" />,
      title: 'Data Storage & Hosting',
      content: `Our website is hosted on Vercel, and order data is stored in Upstash Redis (EU region). Payment data is handled entirely by Stripe. Email communications are sent via Resend. We choose providers with strong security track records and appropriate data processing agreements in place.`,
    },
    {
      icon: <Globe className="w-6 h-6 text-amber" />,
      title: 'Third-Party Services',
      content: `We use trusted third-party services to operate our business. These providers only receive the data necessary to perform their functions:

• Stripe — payment processing
• Resend — transactional and marketing emails
• Vercel — website hosting and serverless functions
• Upstash Redis — order data storage
• Courier partners — shipping and delivery

Each of these providers maintains their own privacy policy and security standards. We do not authorise them to use your data for their own marketing purposes.`,
    },
    {
      icon: <Cookie className="w-6 h-6 text-amber" />,
      title: 'Cookies & Tracking',
      content: `We use cookies and similar technologies to:

• Remember your cart contents across browsing sessions
• Store your language preference (English / Thai)
• Maintain your session state during checkout
• Analyse website traffic and usage patterns via basic analytics

You can disable cookies in your browser settings, but this may affect your shopping experience — for example, your cart may not persist between pages.`,
    },
    {
      icon: <Mail className="w-6 h-6 text-amber" />,
      title: 'Marketing Communications',
      content: `With your consent, we may send you marketing emails about new products, restocks, and special offers. You can unsubscribe at any time by clicking the unsubscribe link at the bottom of any marketing email or by contacting us directly.

Transactional emails (order confirmations, shipping updates, password resets) are necessary to fulfil our service and cannot be opted out of while you have an active order or account.`,
    },
    {
      icon: <Phone className="w-6 h-6 text-amber" />,
      title: 'SMS & Messaging',
      content: `We do not currently send SMS or WhatsApp marketing messages. If this changes in the future, we will only message you with explicit consent and will provide an easy opt-out method. Order-related communication is handled via email only.`,
    },
    {
      icon: <FileText className="w-6 h-6 text-amber" />,
      title: 'Analytics',
      content: `We use Vercel Analytics and Speed Insights to understand how visitors interact with our website. This data is anonymised and aggregated. We do not use Google Analytics or Facebook Pixel, and we do not track you across other websites.`,
    },
    {
      icon: <UserCheck className="w-6 h-6 text-amber" />,
      title: 'Your Rights',
      content: `Depending on your location, you may have the right to:

• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your personal data (subject to legal retention requirements)
• Object to or restrict certain processing activities
• Withdraw consent for marketing communications
• Request a copy of your data in a portable format

To exercise any of these rights, contact us at gingerbros.brew@gmail.com. We will respond within 30 days.`,
    },
    {
      icon: <HardDrive className="w-6 h-6 text-amber" />,
      title: 'Data Retention',
      content: `We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required by law.

• Order and payment records: retained for at least 7 years for tax and accounting purposes
• Newsletter subscriber data: retained until you unsubscribe or request deletion
• Customer portal access links: retained for the duration of your active subscription plus 1 year
• Server logs: retained for 30 days`,
    },
    {
      icon: <Baby className="w-6 h-6 text-amber" />,
      title: "Children's Privacy",
      content: `Our website and products are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately and we will delete it.`,
    },
    {
      icon: <Globe className="w-6 h-6 text-amber" />,
      title: 'International Transfers',
      content: `Your data may be transferred to and processed in countries other than Thailand, including the United States and the European Union, where our hosting and payment processing partners operate. We ensure appropriate safeguards are in place to protect your data during such transfers, including the use of Standard Contractual Clauses where required.`,
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-amber" />,
      title: 'Data Breaches',
      content: `In the unlikely event of a data breach that poses a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours and affected individuals without undue delay.`,
    },
    {
      icon: <FileKey className="w-6 h-6 text-amber" />,
      title: 'Changes to This Policy',
      content: `We may update this privacy policy from time to time to reflect changes in our practices or for legal reasons. We will post the updated policy on this page with a revised "last updated" date. We encourage you to review this page periodically.

For significant changes that materially affect your rights, we will notify you via email before the changes take effect.`,
    },
  ];

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title="Privacy Policy | GingerBros"
        description="GingerBros privacy policy — how we collect, use, and protect your personal information when you shop at gingerbrosshop.com."
        path="/privacy"
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
        <h1 className="font-display font-bold text-deep-brown text-3xl md:text-4xl mb-4 text-center">Privacy Policy</h1>
        <p className="font-body text-earth text-center mb-12">Last updated: August 2025</p>

        <p className="font-body text-earth leading-relaxed mb-10 text-center max-w-[600px] mx-auto">
          At GingerBros, we take your privacy seriously. This policy explains what information we collect, how we use it, and how we keep it safe. It applies to all visitors and customers of gingerbrosshop.com.
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
          <h3 className="font-display font-semibold text-[1.1rem] mb-2">Questions about your privacy?</h3>
          <p className="font-body text-cream/80 text-[14px] mb-4 max-w-[480px] mx-auto">
            If you have any questions about this privacy policy or how we handle your data, please get in touch.
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
