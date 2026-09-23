import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Bell, Share2, MoreHorizontal, X, Check, ArrowRight } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog';
import { defaultPrice } from '@/lib/catalog';
import {
  ensureFontLoaded,
  withUtm,
  type LinkBlock,
  type LinkPageConfig,
  type Sticker,
  SOCIAL_LABELS,
  stickerCredits,
} from '@/lib/linkpage';
import SocialIcon from './SocialIcon';
import StickerMedia, { StickerOutlineDefs } from './StickerMedia';

const CORNER_PX = { square: 0, sm: 8, md: 16, pill: 9999 } as const;
const THUMB_CORNER_PX = { square: 0, sm: 4, md: 10, pill: 9999 } as const;
const SHOP_URL = 'https://gingerbrosshop.com';

export interface LinkPageViewProps {
  config: LinkPageConfig;
  products?: CatalogProduct[];
  /** Absolute URL used for Share buttons. */
  pageUrl: string;
  /** Admin preview: no desktop frame, links don't navigate. */
  preview?: boolean;
  onLinkClick?: (blockId: string) => void;
  onSignup?: (email: string) => Promise<{ ok: boolean; message: string }>;
  /** Sticker editing (admin): stickers become draggable. */
  editStickers?: boolean;
  selectedStickerId?: string | null;
  onStickerSelect?: (id: string) => void;
  onStickerMove?: (id: string, x: number, y: number) => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function blockHref(block: LinkBlock): string | null {
  switch (block.type) {
    case 'link':
      return block.utm ? withUtm(block.url, block.title) : block.url;
    case 'social-card':
      return block.url;
    case 'product':
      return withUtm(`${SHOP_URL}/product/${encodeURIComponent(block.productId)}`, block.productId);
    default:
      return null;
  }
}

export default function LinkPageView(props: LinkPageViewProps) {
  const { config, preview = false } = props;
  const { theme, profile } = config;
  const [signupOpen, setSignupOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    ensureFontLoaded(theme.font);
  }, [theme.font]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const share = async (title: string, url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      return; // user cancelled the share sheet
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied');
    } catch {
      setToast(url);
    }
  };

  const bg = theme.background;
  const pageBackground: CSSProperties =
    bg.type === 'gradient'
      ? { background: `linear-gradient(180deg, ${bg.color}, ${bg.color2})` }
      : bg.type === 'image' && bg.imageUrl
        ? { backgroundColor: bg.color, backgroundImage: `url("${bg.imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: bg.color };

  const fontFamily = `'${theme.font}', 'Noto Sans Thai', system-ui, sans-serif`;
  const hasSignupBlock = config.blocks.some((b) => b.type === 'signup');

  const stickersFor = (anchor: string) => config.stickers.filter((s) => s.anchor === anchor);

  const column = (
    <div
      className="relative mx-auto w-full max-w-[580px] min-h-full flex flex-col"
      style={{ ...pageBackground, color: theme.textColor, fontFamily }}
    >
      <style>{KEYFRAMES}</style>
      <StickerOutlineDefs />

      {/* Top bar: Subscribe + Share, like Linktree */}
      <div className="flex items-center justify-end gap-2 px-4 pt-4 h-16 relative z-20">
        {config.showSubscribeButton && (hasSignupBlock || props.onSignup) && (
          <button
            type="button"
            onClick={() => setSignupOpen(true)}
            className="h-10 px-4 rounded-full bg-white/90 text-[14px] font-medium text-black flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-white transition-colors"
          >
            <Bell className="w-4 h-4" aria-hidden />
            Subscribe
          </button>
        )}
        {config.showShareButton && (
          <button
            type="button"
            aria-label="Share this page"
            onClick={() => share(profile.name, props.pageUrl)}
            className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-white transition-colors"
          >
            <Share2 className="w-4 h-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Profile header */}
      <Anchor id="header" stickers={stickersFor('header')} {...props}>
        <div className="flex flex-col items-center text-center px-7 pt-12">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-black/10" />
          )}
          <h1 className="mt-4 text-[24px] leading-[1.2] font-semibold tracking-normal" style={{ fontFamily: 'inherit' }}>{profile.name}</h1>
          {profile.bio && (
            <p className="mt-1 text-[16px] leading-6 font-medium whitespace-pre-line break-words max-w-full">{profile.bio}</p>
          )}
        </div>
      </Anchor>

      {config.socials.length > 0 && (
        <Anchor id="socials" stickers={stickersFor('socials')} {...props}>
          <div className="flex items-center justify-center gap-4 pt-4 pb-2 px-7">
            {config.socials.map((s, i) => (
              <a
                key={`${s.type}-${i}`}
                href={s.url}
                target={preview ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={SOCIAL_LABELS[s.type]}
                onClick={(e) => {
                  if (preview) e.preventDefault();
                  else props.onLinkClick?.(`social-${s.type}`);
                }}
                className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <SocialIcon type={s.type} size={26} />
              </a>
            ))}
          </div>
        </Anchor>
      )}

      {/* Blocks */}
      <div className="flex flex-col gap-[14px] px-7 pt-6 pb-10">
        {config.blocks.map((block) => (
          <Anchor key={block.id} id={block.id} stickers={stickersFor(block.id)} {...props}>
            <BlockView
              block={block}
              theme={config.theme}
              products={props.products}
              preview={preview}
              onClick={() => props.onLinkClick?.(block.id)}
              onShare={(title, url) => share(title, url)}
              onSignup={props.onSignup}
            />
          </Anchor>
        ))}
      </div>

      <footer className="mt-auto pb-8 pt-2 flex flex-col items-center gap-3">
        <a
          href={withUtm(SHOP_URL, 'footer')}
          onClick={(e) => preview && e.preventDefault()}
          className="h-10 px-4 rounded-full bg-white/90 text-[14px] font-semibold text-black flex items-center hover:bg-white transition-colors"
        >
          gingerbrosshop.com
        </a>
        {stickerCredits(config.stickers.map((st) => st.imageUrl)).map((c) => (
          <a
            key={c.key}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => preview && e.preventDefault()}
            className="text-[11px] opacity-50 hover:opacity-80"
          >
            {c.text}
          </a>
        ))}
      </footer>

      {signupOpen && (
        <div className="absolute inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30" onClick={() => setSignupOpen(false)}>
          <div className="w-full sm:max-w-[440px] bg-white text-black rounded-t-3xl sm:rounded-3xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end">
              <button type="button" aria-label="Close" onClick={() => setSignupOpen(false)} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SignupForm
              headline={`Join ${profile.name}`}
              subtext="Get news, drops and a welcome code in your inbox."
              buttonText="Subscribe"
              onSignup={props.onSignup}
              preview={preview}
              buttonColor="#000000"
              buttonTextColor="#ffffff"
              corner={9999}
            />
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-2 rounded-full bg-black text-white text-sm max-w-[90%] truncate">
          {toast}
        </div>
      )}
    </div>
  );

  if (preview) return column;

  // Desktop gets Linktree's framed look: the column sits on a darker tint of the page colour.
  return (
    <div className="min-h-[100dvh] sm:py-6" style={{ backgroundColor: `color-mix(in srgb, ${bg.color} 88%, #000)` }}>
      <div className="min-h-[100dvh] sm:min-h-[calc(100dvh-48px)] sm:max-w-[580px] sm:mx-auto sm:rounded-3xl overflow-hidden flex">
        {column}
      </div>
    </div>
  );
}

// ── Anchors & stickers ────────────────────────────────────────────────────

function Anchor({
  id,
  stickers,
  children,
  editStickers,
  selectedStickerId,
  onStickerSelect,
  onStickerMove,
}: {
  id: string;
  stickers: Sticker[];
  children: ReactNode;
} & Pick<LinkPageViewProps, 'editStickers' | 'selectedStickerId' | 'onStickerSelect' | 'onStickerMove'>) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} data-anchor={id} className="relative">
      {children}
      {stickers.map((s) => (
        <StickerView
          key={s.id}
          sticker={s}
          anchorRef={ref}
          editable={!!editStickers}
          selected={selectedStickerId === s.id}
          onSelect={onStickerSelect}
          onMove={onStickerMove}
        />
      ))}
    </div>
  );
}

function StickerView({
  sticker,
  anchorRef,
  editable,
  selected,
  onSelect,
  onMove,
}: {
  sticker: Sticker;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  editable: boolean;
  selected: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}) {
  const size = 64 * sticker.scale;
  const style: CSSProperties = {
    left: `${sticker.x * 100}%`,
    top: `${sticker.y * 100}%`,
    width: size,
    height: size,
    zIndex: 10 + sticker.zIndex,
    transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(sticker.id);
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const x = clamp((ev.clientX - rect.left) / rect.width, -0.5, 1.5);
      const y = clamp((ev.clientY - rect.top) / rect.height, -3, 4);
      onMove?.(sticker.id, Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000);
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute select-none ${editable ? 'cursor-grab active:cursor-grabbing touch-none' : 'pointer-events-none'} ${
        selected ? 'outline outline-2 outline-dashed outline-blue-500 outline-offset-2' : ''
      }`}
      style={style}
    >
      <StickerMedia url={sticker.imageUrl} size={size} outline={sticker.outline} />
    </div>
  );
}

// ── Blocks ────────────────────────────────────────────────────────────────

interface BlockViewProps {
  block: LinkBlock;
  theme: LinkPageConfig['theme'];
  products?: CatalogProduct[];
  preview: boolean;
  onClick: () => void;
  onShare: (title: string, url: string) => void;
  onSignup?: LinkPageViewProps['onSignup'];
}

function buttonStyle(theme: LinkPageConfig['theme']): CSSProperties {
  const radius = CORNER_PX[theme.corner];
  const base: CSSProperties = { borderRadius: radius, color: theme.buttonTextColor };
  switch (theme.buttonStyle) {
    case 'outline':
      return { ...base, border: `2px solid ${theme.buttonColor}`, background: 'transparent', color: theme.buttonTextColor };
    case 'soft-shadow':
      return { ...base, background: theme.buttonColor, boxShadow: '0 4px 14px rgba(0,0,0,0.12)' };
    case 'hard-shadow':
      return { ...base, background: theme.buttonColor, border: '2px solid #000', boxShadow: '4px 4px 0 #000' };
    default:
      return { ...base, background: theme.buttonColor };
  }
}

function highlightClass(h: LinkBlock['highlight']): string {
  if (h === 'pulse') return 'lp-pulse';
  if (h === 'wobble') return 'lp-wobble';
  if (h === 'shine') return 'lp-shine';
  return '';
}

function BlockView({ block, theme, products, preview, onClick, onShare, onSignup }: BlockViewProps) {
  const href = blockHref(block);
  const style = buttonStyle(theme);
  const thumbRadius = THUMB_CORNER_PX[theme.corner];

  if (block.type === 'header') {
    return <h2 className="text-center text-[16px] font-semibold pt-2" style={{ fontFamily: 'inherit' }}>{block.title}</h2>;
  }

  if (block.type === 'signup') {
    return (
      <div className={`p-5 ${highlightClass(block.highlight)}`} style={style}>
        <SignupForm
          headline={block.headline}
          subtext={block.subtext}
          buttonText={block.buttonText}
          onSignup={onSignup}
          preview={preview}
          buttonColor={theme.buttonTextColor}
          buttonTextColor={theme.buttonColor}
          corner={CORNER_PX[theme.corner]}
        />
      </div>
    );
  }

  if (block.type === 'product') {
    const product = products?.find((p) => p.id === block.productId);
    const price = product ? defaultPrice(product) : undefined;
    const title = block.title || product?.name || block.productId;
    return (
      <a
        href={href ?? '#'}
        target={preview ? undefined : '_blank'}
        rel="noopener"
        onClick={(e) => (preview ? e.preventDefault() : onClick())}
        className={`relative flex items-center gap-3 p-2 pr-4 min-h-[88px] transition-transform hover:scale-[1.02] ${highlightClass(block.highlight)}`}
        style={style}
      >
        {product?.images[0] ? (
          <img src={product.images[0]} alt="" className="w-[72px] h-[72px] object-cover bg-white/60 shrink-0" style={{ borderRadius: thumbRadius }} />
        ) : (
          <div className="w-[72px] h-[72px] bg-black/10 shrink-0" style={{ borderRadius: thumbRadius }} />
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[16px] font-semibold leading-snug truncate">{title}</p>
          {price?.unitAmount != null && <p className="text-[14px] opacity-80">฿{price.unitAmount.toLocaleString('en-US')}</p>}
        </div>
        <span className="flex items-center gap-1 text-[14px] font-semibold shrink-0">
          Shop <ArrowRight className="w-4 h-4" aria-hidden />
        </span>
      </a>
    );
  }

  // link + social-card share the Linktree button shape: 64px tall, 48px thumbnail inset 8px.
  const title = block.title;
  const thumb = block.type === 'link' ? block.thumbnailUrl : block.imageUrl;
  const isCard = block.type === 'social-card';

  return (
    <div className={`relative group ${highlightClass(block.highlight)}`}>
      <a
        href={href ?? '#'}
        target={preview ? undefined : '_blank'}
        rel="noopener noreferrer"
        onClick={(e) => (preview ? e.preventDefault() : onClick())}
        className="relative flex items-center justify-center min-h-16 px-16 py-2 transition-transform hover:scale-[1.02] overflow-hidden"
        style={style}
      >
        {thumb && (
          <img
            src={thumb}
            alt=""
            className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 object-cover"
            style={{ borderRadius: isCard ? 9999 : thumbRadius }}
          />
        )}
        <span className="text-center leading-tight">
          <span className="block text-[16px] font-medium">{title}</span>
          {isCard && block.handle && (
            <span className="mt-0.5 flex items-center justify-center gap-1 text-[12px] opacity-75">
              <SocialIcon type={block.network} size={12} />@{block.handle}
            </span>
          )}
        </span>
      </a>
      {href && (
        <button
          type="button"
          aria-label={`Share ${title}`}
          onClick={() => onShare(title, href)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5"
          style={{ color: theme.buttonTextColor }}
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

function SignupForm({
  headline,
  subtext,
  buttonText,
  onSignup,
  preview,
  buttonColor,
  buttonTextColor,
  corner,
}: {
  headline: string;
  subtext: string;
  buttonText: string;
  onSignup?: LinkPageViewProps['onSignup'];
  preview: boolean;
  buttonColor: string;
  buttonTextColor: string;
  corner: number;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview || !onSignup) return;
    setState('sending');
    const result = await onSignup(email);
    setMessage(result.message);
    setState(result.ok ? 'done' : 'error');
  };

  return (
    <div className="text-center">
      <p className="text-[18px] font-semibold">{headline}</p>
      {subtext && <p className="mt-1 text-[14px] opacity-80">{subtext}</p>}
      {state === 'done' ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-[15px] font-medium">
          <Check className="w-5 h-5" aria-hidden /> {message}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="flex-1 min-w-0 h-12 px-4 bg-white text-black text-[15px] border border-black/15 focus:outline-none focus:ring-2 focus:ring-black/20"
            style={{ borderRadius: Math.min(corner, 9999) }}
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="h-12 px-5 text-[15px] font-semibold disabled:opacity-60 shrink-0"
            style={{ background: buttonColor, color: buttonTextColor, borderRadius: Math.min(corner, 9999) }}
          >
            {state === 'sending' ? '…' : buttonText}
          </button>
        </form>
      )}
      {state === 'error' && <p className="mt-2 text-[13px] text-red-700">{message}</p>}
    </div>
  );
}

const KEYFRAMES = `
@keyframes lp-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.035) } }
@keyframes lp-wobble { 0%,86%,100% { transform: rotate(0) } 89% { transform: rotate(-2deg) } 92% { transform: rotate(2deg) } 95% { transform: rotate(-1deg) } }
@keyframes lp-shine { 0% { left: -60% } 60%,100% { left: 130% } }
.lp-pulse { animation: lp-pulse 1.8s ease-in-out infinite }
.lp-wobble { animation: lp-wobble 3s ease-in-out infinite }
.lp-shine > a { position: relative }
.lp-shine > a::after { content: ''; position: absolute; top: 0; bottom: 0; width: 40%; left: -60%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); animation: lp-shine 2.6s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .lp-pulse, .lp-wobble, .lp-shine > a::after { animation: none } }
`;
