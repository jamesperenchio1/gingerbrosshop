import { useLayoutEffect, type DependencyList, type RefObject } from 'react';

/**
 * Scroll-reveal animations, built on IntersectionObserver + the Web Animations
 * API. No animation library — this replaced GSAP + ScrollTrigger, which cost
 * ~45 KB gzipped and brought a global refresh/kill/scroll-memory machine that
 * caused three separate production bugs.
 *
 * The design goal is that "content stuck invisible" is *structurally*
 * impossible, not merely unlikely:
 *
 *  - The animation's end state is the element's own authored state. Nothing is
 *    ever committed to the element; there is no `fill: 'forwards'`.
 *  - The inline `opacity: 0` is removed the moment the animation *starts*, with
 *    `fill: 'backwards'` covering the stagger delay. So cancelling, unmounting,
 *    or throwing part-way through leaves the element plainly visible.
 *  - Anything already at or above the fold when the reveal is declared plays
 *    immediately rather than waiting for a scroll event that may never come
 *    (tab switch, back navigation, deep link).
 *  - No IntersectionObserver, or `prefers-reduced-motion: reduce`, means
 *    nothing is ever hidden in the first place.
 */

export const REVEAL = {
  y: 40,
  duration: 0.7,
  /** Roughly GSAP's power3.out. */
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  start: 'top 85%',
} as const;

export type RevealTarget = Element | null | undefined | ArrayLike<Element>;

export interface RevealOptions {
  /** Element whose position drives the reveal. Defaults to the first target. */
  trigger?: Element | null;
  y?: number;
  scale?: number;
  /** Seconds. */
  duration?: number;
  /** Seconds between successive targets. */
  stagger?: number;
  /** Seconds before the first target starts. */
  delay?: number;
  /** GSAP-style trigger point, e.g. `'top 80%'`. Mapped to a root margin. */
  start?: string;
  /** Play on mount instead of waiting for the element to scroll into view. */
  immediate?: boolean;
}

export type RevealFn = (target: RevealTarget, options?: RevealOptions) => void;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function toElements(target: RevealTarget): HTMLElement[] {
  if (!target) return [];
  const list = target instanceof Element ? [target] : Array.from(target as ArrayLike<Element>);
  return list.filter((el): el is HTMLElement => el instanceof HTMLElement);
}

/** `'top 80%'` → the element must reach 80% of the viewport height. */
function rootMarginFromStart(start: string): string {
  const match = /(\d+(?:\.\d+)?)%/.exec(start);
  const percent = match ? Number(match[1]) : 85;
  return `0px 0px -${Math.max(0, 100 - percent)}% 0px`;
}

function clearInlineState(el: HTMLElement) {
  el.style.removeProperty('opacity');
  el.style.removeProperty('transform');
  el.style.removeProperty('will-change');
}

/**
 * Declare a section's reveals. Runs in a layout effect so elements are hidden
 * before first paint (no flash of un-animated content).
 *
 * ```ts
 * useReveal(sectionRef, (reveal) => {
 *   reveal(headerRef.current);
 *   reveal(cardsRef.current?.children, { stagger: 0.12, trigger: cardsRef.current });
 * }, [loading]);
 * ```
 */
export function useReveal(
  scopeRef: RefObject<HTMLElement | null>,
  build: (reveal: RevealFn) => void,
  deps: DependencyList = [],
) {
  useLayoutEffect(() => {
    if (!scopeRef.current) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    const observers: IntersectionObserver[] = [];
    const animations: Animation[] = [];
    const pending = new Set<HTMLElement>();

    const reveal: RevealFn = (target, options = {}) => {
      const els = toElements(target);
      if (els.length === 0) return;

      const y = options.y ?? REVEAL.y;
      const scale = options.scale ?? 1;
      const duration = (options.duration ?? REVEAL.duration) * 1000;
      const stagger = (options.stagger ?? 0) * 1000;
      const baseDelay = (options.delay ?? 0) * 1000;
      const from = `translateY(${y}px)${scale === 1 ? '' : ` scale(${scale})`}`;

      for (const el of els) {
        el.style.opacity = '0';
        el.style.transform = from;
        el.style.willChange = 'opacity, transform';
        pending.add(el);
      }

      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        els.forEach((el, i) => {
          pending.delete(el);
          // Drop the inline hide *before* animating: `fill: 'backwards'` holds
          // the start frame through the delay, and the element's own styles
          // take over the instant the animation ends or is cancelled.
          clearInlineState(el);
          animations.push(
            el.animate(
              [
                { opacity: 0, transform: from },
                { opacity: 1, transform: 'none' },
              ],
              {
                duration,
                delay: baseDelay + i * stagger,
                easing: REVEAL.easing,
                fill: 'backwards',
              },
            ),
          );
        });
      };

      const triggerEl = options.trigger ?? els[0];
      // Already on screen, or scrolled past — there is no future intersection
      // to wait for.
      if (options.immediate || triggerEl.getBoundingClientRect().top < window.innerHeight) {
        play();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            play();
            observer.disconnect();
          }
        },
        { rootMargin: rootMarginFromStart(options.start ?? REVEAL.start) },
      );
      observer.observe(triggerEl);
      observers.push(observer);
    };

    build(reveal);

    return () => {
      for (const observer of observers) observer.disconnect();
      for (const animation of animations) animation.cancel();
      // Anything that never got its turn goes back to visible rather than
      // being left hidden for a remount to inherit.
      for (const el of pending) clearInlineState(el);
      pending.clear();
    };
    // `build` is an inline closure by design; callers control re-runs via deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
