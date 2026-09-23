import { useEffect, useRef, type CSSProperties } from 'react';
import { stickerThumb } from '@/lib/linkpage';

// White die-cut border that follows the sticker's shape: stacked hard
// drop-shadows in eight directions, plus a soft lift underneath. Works on
// SVG (Lottie), PNG and animated WebP alike.
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
  const style: CSSProperties = { width: '100%', height: '100%', filter: outline ? outlineFilter(size / 28) : undefined };
  if (!url.endsWith('.json')) {
    return <img src={url} alt="" draggable={false} className="w-full h-full object-contain" style={style} />;
  }
  return <LottieMedia url={url} style={style} />;
}

function LottieMedia({ url, style }: { url: string; style: CSSProperties }) {
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

  // Static SVG shows instantly while the (small) animation loads.
  return (
    <div ref={box} style={style}>
      <img src={stickerThumb(url)} alt="" draggable={false} className="w-full h-full object-contain" />
    </div>
  );
}
