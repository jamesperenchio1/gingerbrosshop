import type { SocialType } from '@/lib/linkpage';

/** Solid 24px glyphs in currentColor, sized to match Linktree's social row. */
export default function SocialIcon({ type, size = 24 }: { type: SocialType; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true } as const;
  switch (type) {
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2a10 10 0 0 0-1.6 19.87v-7.02H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.45 2.85H13.5v7.02A10 10 0 0 0 12 2z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...common} fill="currentColor">
          <path d="M16.5 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 1 0 5.3 6.2V8.6a7.8 7.8 0 0 0 4.5 1.4V6.7a4.5 4.5 0 0 1-4.5-4.5z" />
        </svg>
      );
    case 'line':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 5.9-3.5 8-6A7.3 7.3 0 0 0 22 11c0-4.4-4.5-8-10-8zM8.3 13.4H6.4a.5.5 0 0 1-.5-.5V9.1a.5.5 0 0 1 1 0v3.3h1.4a.5.5 0 0 1 0 1zm2 -.5a.5.5 0 0 1-1 0V9.1a.5.5 0 0 1 1 0v3.8zm4.6 0a.5.5 0 0 1-.9.3l-1.9-2.6v2.3a.5.5 0 0 1-1 0V9.1a.5.5 0 0 1 .9-.3l1.9 2.6V9.1a.5.5 0 0 1 1 0v3.8zm3.1-2.4a.5.5 0 0 1 0 1h-1.4v.9H18a.5.5 0 0 1 0 1h-1.9a.5.5 0 0 1-.5-.5V9.1c0-.3.2-.5.5-.5H18a.5.5 0 0 1 0 1h-1.4v.9H18z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common} fill="currentColor">
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common} fill="currentColor">
          <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
        </svg>
      );
    case 'shopee':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2.5a4 4 0 0 0-4 3.8H4.3a.8.8 0 0 0-.8.9l1.2 12.4A2.3 2.3 0 0 0 7 21.7h10a2.3 2.3 0 0 0 2.3-2.1l1.2-12.4a.8.8 0 0 0-.8-.9H16a4 4 0 0 0-4-3.8zm0 1.6a2.4 2.4 0 0 1 2.4 2.2H9.6A2.4 2.4 0 0 1 12 4.1zm.2 5.6c1.3 0 2.2.5 2.7.9l-.6 1c-.5-.3-1.2-.7-2.1-.7-.9 0-1.4.4-1.4.9 0 1.5 4.5 1 4.5 4 0 1.5-1.3 2.6-3.3 2.6-1.4 0-2.6-.6-3.2-1.1l.7-1c.6.5 1.5.9 2.5.9 1.1 0 1.8-.5 1.8-1.2 0-1.7-4.5-1.1-4.5-4 0-1.3 1.2-2.3 2.9-2.3z" />
        </svg>
      );
    case 'email':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case 'website':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
      );
  }
}
