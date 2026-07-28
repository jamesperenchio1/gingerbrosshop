import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import CopyButton from '@/components/CopyButton';

interface ReferralInfo {
  code: string;
  creditBaht: number;
  referrals: number;
}

/**
 * Shows a customer their referral code and current store-credit balance,
 * fetched from /api/referral. Give them somewhere to actually see and share
 * the code — previously the referral system had no frontend surface at all.
 */
export default function ReferralCard({ email }: { email: string }) {
  const [info, setInfo] = useState<ReferralInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/referral?email=${encodeURIComponent(email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setInfo(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (!info) return null;

  const shareUrl = `${window.location.origin}/?ref=${info.code}`;

  return (
    <div className="bg-white border border-soft-peach rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Gift className="w-5 h-5 text-earth" />
        <h3 className="font-display font-semibold text-deep-brown">Give ฿5, Get ฿5</h3>
      </div>
      <p className="font-body text-earth mb-4">
        Share your code with a friend — they get ฿5 store credit on their first order, and
        you get ฿5 too, automatically applied at your next checkout.
        {info.creditBaht > 0 && (
          <>
            {' '}You currently have <span className="font-semibold text-deep-brown">฿{info.creditBaht}</span> in credit.
          </>
        )}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-cream border border-soft-peach rounded-full px-5 py-2.5 font-display font-semibold text-deep-brown tracking-wide">
          {info.code}
        </div>
        <CopyButton value={info.code} label="Copy code" />
        <CopyButton value={shareUrl} label="Copy share link" />
      </div>
    </div>
  );
}
