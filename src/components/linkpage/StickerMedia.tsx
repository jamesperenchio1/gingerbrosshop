import { useEffect, useRef, type CSSProperties } from 'react';
import { stickerThumb } from '@/lib/linkpage';

// White die-cut border for STATIC artwork: stacked hard drop-shadows in eight
// directions, plus a soft lift underneath. Cheap here because static pixels are
// rasterised once. NEVER apply this to animating content — a filter chain over a
// 60 fps SVG forces a full re-raster every frame and drops the page to ~7 fps.
function outlineFilter(px: number): string {
  const d = Math.max(1.5, px);
  const dirs = [
    [d, 0], [-d, 0], [0, d], [0, -d],
    [d * 0.7, d * 0.7], [-d * 0.7, d * 0.7], [d * 0.7, -d * 0.7], [-d * 0.7, -d * 0.7],
  ];
  return [...dirs.map(([x, y]) => `drop-shadow(${x.toFixed(1)}px ${y.toFixed(1)}px 0 #fff)`), 'drop-shadow(0 2px 3px rgba(0,0,0,0.18))'].join(' ');
}

export const STICKER_OUTLINE_ID = 'gb-sticker-outline';

/**
 * Shared SVG filter used by animated stickers: dilate the artwork's own alpha
 * into a solid white silhouette. Rendered once per page; because it is applied
 * to a *static* layer the browser rasterises it a single time.
 */
export function StickerOutlineDefs() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <filter id={STICKER_OUTLINE_ID} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="dilated" />
          <feFlood floodColor="#fff" floodOpacity="1" result="white" />
          <feComposite in="white" in2="dilated" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A sticker's artwork: animated Lottie for .json URLs, a plain image otherwise. */
export default function StickerMedia({ url, size, outline }: { url: string; size: number; outline: boolean }) {
  if (!url.endsWith('.json')) {
    // Static artwork: the CSS drop-shadow chain is effectively free here.
    const style: CSSProperties = { width: '100%', height: '100%', filter: outline ? outlineFilter(size / 28) : undefined };
    return <img src={url} alt="" draggable={false} className="w-full h-full object-contain" style={style} />;
  }
  return <LottieMedia url={url} outline={outline} />;
}

function LottieMedia({ url, outline }: { url: string; outline: boolean }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let anim: { destroy: () => void } | null = null;
    // lottie_light: SVG renderer only, no expression eval, so it runs under our CSP.
    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (cancelled || !box.current) return;
      box.current.replaceChildren(); // drop the static placeholder
      const still = prefersReducedMotion();
      const a = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: !still, autoplay: !still, path: url });
      anim = a;
      if (still) a.addEventListener('DOMLoaded', () => a.goToAndStop(0, true));
    });
    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [url]);

  const thumb = stickerThumb(url);
  return (
    <div className="relative w-full h-full">
      {/* White die-cut border: a static silhouette behind the animation. */}
      {outline && (
        <img
          src={thumb}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ filter: `url(#${STICKER_OUTLINE_ID}) drop-shadow(0 2px 3px rgba(0,0,0,0.18))` }}
        />
      )}
      {/* The animation itself stays unfiltered so it renders on the compositor. */}
      <div ref={box} className="absolute inset-0 w-full h-full">
        <img src={thumb} alt="" draggable={false} className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
