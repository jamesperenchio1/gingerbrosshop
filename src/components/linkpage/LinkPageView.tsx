import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
  /** `?src=` tag this visit arrived with (e.g. "stall"); forwarded to shop links so orders keep it. */
  srcTag?: string;
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

/** Carry the visit's `?src=` tag onto shop links so the order records where the customer first scanned. */
function withSrc(url: string, src?: string): string {
  if (!src) return url;
  try {
    const u = new URL(url);
    if (!/(^|\.)gingerbrosshop\.com$/i.test(u.hostname) || u.hostname.startsWith('link.')) return url;
    if (!u.searchParams.has('src')) u.searchParams.set('src', src);
    return u.toString();
  } catch {
    return url;
  }
}

function blockHref(block: LinkBlock, src?: string): string | null {
  switch (block.type) {
    case 'link':
      return withSrc(block.utm ? withUtm(block.url, block.title) : block.url, src);
    case 'social-card':
      return block.url;
    case 'product':
      return withSrc(withUtm(`${SHOP_URL}/product/${encodeURIComponent(block.productId)}`, block.productId), src);
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
              srcTag={props.srcTag}
              onClick={() => props.onLinkClick?.(block.id)}
              onShare={(title, url) => share(title, url)}
              onSignup={props.onSignup}
            />
          </Anchor>
        ))}
      </div>

      <footer className="mt-auto pb-8 pt-2 flex flex-col items-center gap-3">
        <a
          href={withSrc(withUtm(SHOP_URL, 'footer'), props.srcTag)}
          onClick={(e) => preview && e.preventDefault()}
          className="h-10 px-4 rounded-full bg-white/90 text-[14px] font-semibold text-black flex items-center hover:bg-white transition-colors"
        >
          gingerbrosshop.com
        </a>
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

const REACTIONS = ['lp-st-pop', 'lp-st-spin', 'lp-st-wiggle', 'lp-st-hop'] as const;

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

  // Visitor mode: tap to make it react, drag to fling it around — it springs back on release.
  // The box itself is pointer-events:none so it never blocks the links beneath it; instead a
  // document listener hit-tests the sticker and ignores presses that land on a link or button.
  const boxRef = useRef<HTMLDivElement>(null);
  const [reaction, setReaction] = useState<{ cls: string; n: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number; released: boolean } | null>(null);
  const [pressed, setPressed] = useState(false);
  const taps = useRef({ count: 0, last: 0 });
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activePointer = useRef<number | null>(null);

  const react = useCallback(() => {
    const now = Date.now();
    taps.current.count = now - taps.current.last < 700 ? taps.current.count + 1 : 1;
    taps.current.last = now;
    // Rapid tapping escalates to a full spin.
    const cls = taps.current.count >= 4 ? 'lp-st-spin' : REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    setReaction((r) => ({ cls, n: (r?.n ?? 0) + 1 }));
    try {
      navigator.vibrate?.(8);
    } catch {
      // vibration unsupported — purely cosmetic
    }
  }, []);

  useEffect(() => {
    if (editable) return;
    const onDown = (e: PointerEvent) => {
      const box = boxRef.current;
      if (!box || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if ((e.target as Element | null)?.closest('a, button, input, textarea, select, label')) return;
      const r = box.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      if (activePointer.current !== null) return; // one finger per sticker
      // Overlapping stickers: only the one drawn on top (highest z-index, later in the DOM on ties) takes the press.
      let top: HTMLElement = box;
      let topZ = Number(getComputedStyle(box).zIndex) || 0;
      document.querySelectorAll<HTMLElement>('.lp-sticker').forEach((other) => {
        if (other === box) return;
        const o = other.getBoundingClientRect();
        if (e.clientX < o.left || e.clientX > o.right || e.clientY < o.top || e.clientY > o.bottom) return;
        const z = Number(getComputedStyle(other).zIndex) || 0;
        if (z > topZ || (z === topZ && box.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING)) {
          top = other;
          topZ = z;
        }
      });
      if (top !== box) return;

      if (e.pointerType === 'mouse') e.preventDefault(); // no text selection while dragging
      clearTimeout(resetTimer.current); // a previous release's spring-back must not cancel this drag
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      activePointer.current = e.pointerId;
      setPressed(true);
      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.hypot(dx, dy) < 6) return;
        moved = true;
        // Rubber-band: the further you pull, the more it resists.
        const damp = (v: number) => Math.sign(v) * Math.min(Math.abs(v) * 0.8, 90);
        setOffset({ x: damp(dx), y: damp(dy), released: false });
      };
      const end = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        activePointer.current = null;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        setPressed(false);
        if (moved) {
          setOffset((o) => (o ? { ...o, released: true } : o));
          resetTimer.current = setTimeout(() => setOffset(null), 650);
        } else if (ev.type === 'pointerup') {
          react();
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    };
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      clearTimeout(resetTimer.current);
    };
  }, [editable, react]);

  const onEditPointerDown = (e: React.PointerEvent) => {
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

  const inner: CSSProperties | undefined = offset
    ? {
        transform: offset.released ? 'translate(0,0)' : `translate(${offset.x}px, ${offset.y}px) scale(1.12)`,
        transition: offset.released ? 'transform 600ms cubic-bezier(0.34, 1.9, 0.5, 1)' : 'none',
      }
    : pressed
      ? { transform: 'scale(0.92)', transition: 'transform 100ms' }
      : undefined;

  return (
    <div
      ref={boxRef}
      onPointerDown={editable ? onEditPointerDown : undefined}
      // Keyboard users get the same reaction as a tap (dragging stays pointer-only).
      {...(editable
        ? {}
        : {
            role: 'button',
            tabIndex: 0,
            'aria-label': 'Sticker — press to play',
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                react();
              }
            },
          })}
      className={`absolute select-none ${
        editable ? 'cursor-grab active:cursor-grabbing touch-none' : 'pointer-events-none lp-sticker rounded-xl'
      } ${selected ? 'outline outline-2 outline-dashed outline-blue-500 outline-offset-2' : ''}`}
      style={style}
    >
      <div className="w-full h-full" style={inner}>
        <div key={reaction?.n ?? 0} className={`w-full h-full ${reaction ? reaction.cls : ''}`}>
          <StickerMedia url={sticker.imageUrl} size={size} outline={sticker.outline} />
        </div>
      </div>
    </div>
  );
}

// ── Blocks ────────────────────────────────────────────────────────────────

interface BlockViewProps {
  block: LinkBlock;
  theme: LinkPageConfig['theme'];
  products?: CatalogProduct[];
  preview: boolean;
  srcTag?: string;
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

function BlockView({ block, theme, products, preview, srcTag, onClick, onShare, onSignup }: BlockViewProps) {
  const href = blockHref(block, srcTag);
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
@keyframes lp-st-pop { 0% { transform: scale(1) } 35% { transform: scale(1.4) rotate(-8deg) } 65% { transform: scale(0.9) rotate(6deg) } 100% { transform: scale(1) } }
@keyframes lp-st-spin { 0% { transform: rotate(0) scale(1) } 50% { transform: rotate(200deg) scale(1.3) } 100% { transform: rotate(360deg) scale(1) } }
@keyframes lp-st-wiggle { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-18deg) } 40% { transform: rotate(16deg) } 60% { transform: rotate(-10deg) } 80% { transform: rotate(6deg) } }
@keyframes lp-st-hop { 0%,100% { transform: translateY(0) scale(1,1) } 30% { transform: translateY(-26px) scale(0.92,1.1) } 55% { transform: translateY(0) scale(1.15,0.85) } 75% { transform: translateY(-8px) } }
.lp-st-pop { animation: lp-st-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) }
.lp-st-spin { animation: lp-st-spin 700ms cubic-bezier(0.34, 1.2, 0.64, 1) }
.lp-st-wiggle { animation: lp-st-wiggle 600ms ease-in-out }
.lp-st-hop { animation: lp-st-hop 640ms ease-out }
.lp-sticker:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px }
@media (prefers-reduced-motion: reduce) { .lp-pulse, .lp-wobble, .lp-shine > a::after, .lp-st-pop, .lp-st-spin, .lp-st-wiggle, .lp-st-hop { animation: none } }
`;
