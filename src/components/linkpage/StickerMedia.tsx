import { useEffect, useRef, type CSSProperties } from 'react';
import { stickerThumb } from '@/lib/linkpage';
import { buildOutlineAnimation } from '@/lib/lottieOutline';

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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A sticker's artwork: animated Lottie for .json URLs, a plain image otherwise. */
export default function StickerMedia({ url, size, outline }: { url: string; size: number; outline: boolean }) {
  if (!url.endsWith('.json')) {
    // Static artwork: the CSS drop-shadow chain is effectively free here.
    const style: CSSProperties = { width: '100%', height: '100%', filter: outline ? outlineFilter(size / 28) : undefined };
    return <img src={url} alt="" draggable={false} className="w-full h-full object-contain" style={style} />;
  }
  return <LottieMedia url={url} size={size} outline={outline} />;
}

type LottieData = Record<string, unknown>;
const animationCache = new Map<string, Promise<LottieData>>();

function loadAnimationData(url: string): Promise<LottieData> {
  let p = animationCache.get(url);
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`sticker ${r.status}`);
      return r.json() as Promise<LottieData>;
    });
    p.catch(() => animationCache.delete(url));
    animationCache.set(url, p);
  }
  return p;
}

function LottieMedia({ url, size, outline }: { url: string; size: number; outline: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const borderBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const players: { destroy: () => void }[] = [];
    // lottie_light: SVG renderer only, no expression eval, so it runs under our CSP.
    Promise.all([import('lottie-web/build/player/lottie_light'), loadAnimationData(url)])
      .then(([{ default: lottie }, data]) => {
        if (cancelled || !box.current) return;
        const still = prefersReducedMotion();
        box.current.replaceChildren(); // drop the static placeholder
        const main = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: !still, autoplay: !still, animationData: structuredClone(data) });
        players.push(main);

        let border: ReturnType<typeof lottie.loadAnimation> | null = null;
        if (outline && borderBox.current) {
          // The white border is the same animation recoloured and thickened, played in lock-step
          // behind the real one, so it follows every movement.
          borderBox.current.replaceChildren();
          border = lottie.loadAnimation({
            container: borderBox.current,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: buildOutlineAnimation(data, Math.max(1.5, size / 28), size),
          });
          players.push(border);
          const sync = () => border?.goToAndStop(main.currentFrame, true);
          main.addEventListener('enterFrame', sync);
          main.addEventListener('DOMLoaded', sync);
        }
        if (still) main.addEventListener('DOMLoaded', () => main.goToAndStop(0, true));
      })
      .catch(() => {
        // Keep the static placeholders if the animation can't load.
      });
    return () => {
      cancelled = true;
      players.forEach((a) => a.destroy());
    };
  }, [url, size, outline]);

  const thumb = stickerThumb(url);
  return (
    <div className="relative w-full h-full">
      {/* White die-cut border: a static silhouette until the animated one is ready. */}
      {outline && (
        <div ref={borderBox} className="absolute inset-0 w-full h-full" aria-hidden>
          <img
            src={thumb}
            alt=""
            draggable={false}
            className="w-full h-full object-contain"
            style={{ filter: outlineFilter(size / 28) }}
          />
        </div>
      )}
      <div ref={box} className="absolute inset-0 w-full h-full">
        <img src={thumb} alt="" draggable={false} className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
