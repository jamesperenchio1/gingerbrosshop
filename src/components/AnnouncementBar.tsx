import { useEffect, useState } from 'react';
import { captureEvent, getFeatureFlagPayload, whenPostHogReady } from '@/lib/posthog';
import { useI18n } from '@/context/I18nContext';

const DISMISS_KEY = 'gbros-banner-dismissed';

type BannerCopy = { en?: string; th?: string };

/**
 * Dismissible announcement bar driven by the `site-banner` PostHog feature
 * flag. The copy lives in the flag payload (`{ en, th }`) so it can be changed
 * without a deploy; the bar renders only after the flag resolves, which keeps
 * the prerendered HTML identical to the first client render.
 */
export default function AnnouncementBar() {
  const { locale, t } = useI18n();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let text: string | null = null;
    const cancel = whenPostHogReady(() => {
      try {
        if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
      } catch {
        // Storage can be unavailable (private mode, blocked cookies).
      }
      const payload = getFeatureFlagPayload('site-banner') as BannerCopy | undefined;
      if (!payload || typeof payload !== 'object') return;
      text = (locale === 'th' ? payload.th : payload.en) || payload.en || null;
      if (!text) return;
      setMessage(text);
      captureEvent('banner_viewed', { banner: 'site-banner', locale });
    });
    return () => {
      cancel();
      text = null;
    };
  }, [locale]);

  if (!message) return null;

  return (
    <div className="relative bg-ginger text-charcoal">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center">
        <p className="font-body text-[12px] font-semibold uppercase tracking-[0.08em] sm:text-[13px]">
          {message}
        </p>
        <button
          type="button"
          aria-label={t('dismissBanner')}
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISS_KEY, '1');
            } catch {
              // ignore
            }
            captureEvent('banner_dismissed', { banner: 'site-banner', locale });
            setMessage(null);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-charcoal/70 transition-colors hover:bg-charcoal/10 hover:text-charcoal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
