import { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

type Step = 'subscribe' | 'verify' | 'done';

export default function Newsletter() {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('subscribe');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus first digit when we enter verify step
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');

      if (data.verification) {
        setStep('verify');
        setResendCooldown(60);
      } else {
        setStep('done');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = useCallback((index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const cleaned = value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 6);
      if (cleaned.length === 0) return;
      const next = ['', '', '', '', '', ''];
      cleaned.split('').forEach((ch, i) => { if (i < 6) next[i] = ch; });
      setDigits(next);
      const focusIdx = Math.min(cleaned.length, 5);
      digitRefs.current[focusIdx]?.focus();
      return;
    }

    const ch = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = ch;
      return next;
    });
    if (ch && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6 || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => digitRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setDigits(['', '', '', '', '', '']);
        setResendCooldown(60);
        setTimeout(() => digitRefs.current[0]?.focus(), 100);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  return (
    <section id="newsletter" className="bg-cream py-20">
      <div className="w-full max-w-[520px] mx-auto px-6 text-center">

        {step === 'subscribe' && (
          <>
            <Mail className="w-8 h-8 text-rust mx-auto mb-5" />
            <h2 className="font-display font-bold text-deep-brown text-[1.75rem] mb-2">{t('newsletterTitle')}</h2>
            <p className="font-body text-earth mb-1">
              {t('newsletterSub')}
            </p>
            <p className="font-body text-earth/60 text-sm mb-8">
              {t('newsletterVerifyHint')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletterEmailPlaceholder')}
                required
                className="flex-1 min-w-0 bg-warm-white border border-soft-peach rounded-full px-5 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex-shrink-0 bg-deep-brown text-cream font-body font-medium px-7 py-3 rounded-full hover:bg-rust active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? t('newsletterSubscribingBtn') : <>{t('newsletterSubscribeBtn')} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            {error && (
              <div className="flex items-center justify-center gap-2 text-rust mt-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-body text-sm">{error}</span>
              </div>
            )}
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="w-12 h-12 rounded-full bg-deep-brown/10 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-5 h-5 text-deep-brown" />
            </div>
            <h2 className="font-display font-bold text-deep-brown text-2xl mb-2">{t('newsletterCheckInbox')}</h2>
            <p className="font-body text-earth mb-1">
              {t('newsletterCodeSentTo')}
            </p>
            <p className="font-body font-semibold text-deep-brown mb-8 break-all">{email}</p>

            <form onSubmit={handleVerify}>
              {/* OTP digit inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { digitRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={6}
                    aria-label={`Verification code digit ${i + 1}`}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`
                      w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold font-display
                      bg-warm-white border-2 rounded-xl text-deep-brown
                      focus:outline-none focus:ring-0 transition-colors
                      ${digit ? 'border-rust' : 'border-soft-peach'}
                      focus:border-deep-brown
                    `}
                    style={{ width: '2.75rem', height: '3.5rem' }}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={digits.join('').length < 6 || loading}
                className="w-full bg-deep-brown text-cream font-body font-medium px-6 py-3.5 rounded-full hover:bg-rust transition-colors disabled:opacity-40 mb-4"
              >
                {loading ? t('newsletterVerifyingBtn') : t('newsletterClaimBtn')}
              </button>
            </form>

            {error && (
              <div className="flex items-center justify-center gap-2 text-rust mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-body text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="flex items-center justify-center gap-1.5 mx-auto text-earth/60 hover:text-earth text-sm font-body transition-colors disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {resendCooldown > 0 ? `${t('newsletterResendIn')} ${resendCooldown}s` : t('newsletterResend')}
            </button>
          </>
        )}

        {step === 'done' && (
          <div className="py-4">
            <CheckCircle className="w-12 h-12 text-accent-green mx-auto mb-5" />
            <h2 className="font-display font-bold text-deep-brown text-2xl mb-2">{t('newsletterDoneTitle')}</h2>
            <p className="font-body text-earth">
              {t('newsletterDoneSub')}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
