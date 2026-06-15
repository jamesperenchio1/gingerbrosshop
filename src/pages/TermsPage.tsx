import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

export default function TermsPage() {
  const navigate = useNavigate();
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
        <p className="font-body text-earth text-center mb-12">Last updated: May 2025</p>

        <div className="space-y-6">
          {[
            {
              title: 'Acceptance of Terms',
              text: 'By accessing and placing an order with GingerBros, you confirm that you are in agreement with and bound by the terms and conditions contained herein.',
            },
            {
              title: 'Products',
              text: 'All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.',
            },
            {
              title: 'Orders',
              text: 'We reserve the right to refuse any order you place with us. We may limit or cancel quantities purchased per person, per household, or per order.',
            },
            {
              title: 'Pricing',
              text: 'All prices are in Thai Baht (THB) and include applicable taxes. Shipping costs are calculated at checkout. Subscription prices are locked at the rate you signed up for.',
            },
            {
              title: 'Subscriptions',
              text: 'Subscription billing recurs automatically at your chosen interval (weekly, every 2 weeks, or monthly). You may pause, skip, or cancel your subscription at any time through your account.',
            },
            {
              title: 'Intellectual Property',
              text: 'All content on this website, including text, graphics, logos, and images, is the property of GingerBros and protected by copyright laws.',
            },
            {
              title: 'Governing Law',
              text: 'These terms shall be governed by and construed in accordance with the laws of Thailand.',
            },
          ].map((section) => (
            <div key={section.title} className="bg-cream rounded-2xl p-8">
              <h2 className="font-display font-semibold text-deep-brown text-lg mb-3">{section.title}</h2>
              <p className="font-body text-earth leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
