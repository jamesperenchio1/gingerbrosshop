import { useRef, useEffect } from 'react';
import { shouldReduceMotion } from '@/lib/utils';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
  drift: number;
  popY: number;
}

export default function BubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Skip entirely on reduced-motion / low-power devices — this is the main
    // source of scroll stutter on weak hardware.
    if (shouldReduceMotion()) return;

    let running = true;
    let needsResize = true;
    let onScreen = true;
    let frameId = 0;
    const bubbles: Bubble[] = [];
    const MAX_BUBBLES = 50;
    let cssW = 0;
    let cssH = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas!.clientWidth * dpr);
      const h = Math.round(canvas!.clientHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      cssW = canvas!.clientWidth;
      cssH = canvas!.clientHeight;
    }

    function spawnBubble() {
      if (bubbles.length >= MAX_BUBBLES) return;

      // Spawn only on far left/right edges (6% of viewport width from each edge)
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const edgeW = cssW * 0.06;
      const x = side === 'left'
        ? Math.random() * edgeW
        : cssW - edgeW + Math.random() * edgeW;

      const r = 1.0 + Math.random() * 3.5;
      bubbles.push({
        x,
        y: cssH + r + Math.random() * 40,
        r,
        speed: 0.5 + Math.random() * 2.0,
        opacity: 0.15 + Math.random() * 0.25,
        drift: (Math.random() - 0.5) * 0.4,
        popY: -r - Math.random() * 50,
      });
    }

    function render() {
      if (!running) return;
      if (needsResize) {
        resize();
        needsResize = false;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      // Spawn 1-2 bubbles per cycle
      if (Math.random() < 0.6) spawnBubble();
      if (Math.random() < 0.3) spawnBubble();

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];

        b.y -= b.speed;
        b.x += b.drift;

        if (b.y < b.popY) {
          bubbles.splice(i, 1);
          continue;
        }

        const fadeZone = cssH * 0.15;
        let alpha = b.opacity;
        if (b.y < fadeZone) {
          alpha *= b.y / fadeZone;
        }

        const drawX = b.x * dpr;
        const drawY = b.y * dpr;
        const drawR = b.r * dpr;

        // Draw bubble with visible rim for glassy effect
        ctx!.beginPath();
        ctx!.arc(drawX, drawY, drawR, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 250, 235, ${alpha})`;
        ctx!.fill();

        // Visible rim stroke
        ctx!.beginPath();
        ctx!.arc(drawX, drawY, drawR, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();

        // Highlight dot
        ctx!.beginPath();
        ctx!.arc(drawX - drawR * 0.3, drawY - drawR * 0.3, Math.max(1, drawR * 0.3), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha * 1.2})`;
        ctx!.fill();
      }

      if (onScreen) frameId = requestAnimationFrame(render);
    }

    const onResize = () => { needsResize = true; };
    window.addEventListener('resize', onResize);

    // Pause the bubble animation when the hero is scrolled out of view.
    const io = new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !onScreen) {
        onScreen = true;
        frameId = requestAnimationFrame(render);
      } else if (!visible) {
        onScreen = false;
      }
    }, { threshold: 0 });
    io.observe(canvas);

    frameId = requestAnimationFrame(render);
    return () => {
      running = false;
      onScreen = false;
      cancelAnimationFrame(frameId);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
