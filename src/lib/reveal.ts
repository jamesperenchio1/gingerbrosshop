import { useEffect, type DependencyList, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared scroll-reveal animation.
 *
 * Three rules keep this from ever leaving content invisible — the failure mode
 * that plagued the hand-rolled `gsap.from({ opacity: 0 })` calls this replaces:
 *
 *  1. `fromTo`, never `from`. A `from` tween treats the element's *current*
 *     style as the end state, so anything that interrupts or re-renders it can
 *     strand the element at opacity 0 with no recovery path.
 *  2. `once: true` + `clearProps`. As soon as the reveal has played, every
 *     inline style GSAP added is removed. A later `ScrollTrigger.refresh()` or
 *     `.kill()` then has nothing left to strand.
 *  3. `prefers-reduced-motion` short-circuits the whole thing: no tweens are
 *     created at all, so the content is simply visible.
 */

/** Shared look-and-feel for every reveal on the site. */
export const REVEAL = {
  y: 40,
  duration: 0.7,
  ease: 'power3.out',
  start: 'top 85%',
} as const;

export type RevealTarget = Element | null | undefined | ArrayLike<Element>;

export interface RevealOptions {
  /** Element whose position drives the trigger. Defaults to the first target. */
  trigger?: Element | null;
  y?: number;
  scale?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  /** ScrollTrigger `start` string, e.g. `'top 80%'`. */
  start?: string;
  /** Play immediately on mount instead of waiting for a scroll trigger. */
  immediate?: boolean;
}

export type RevealFn = (target: RevealTarget, options?: RevealOptions) => void;

function toElements(target: RevealTarget): Element[] {
  if (!target) return [];
  if (target instanceof Element) return [target];
  return Array.from(target as ArrayLike<Element>).filter(Boolean);
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Declare a section's reveal animations. Everything is created inside a
 * `gsap.context` scoped to `scopeRef` and reverted on unmount.
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
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const reveal: RevealFn = (target, options = {}) => {
        const els = toElements(target);
        if (els.length === 0) return;

        // If the element is already inside (or above) the viewport when the
        // reveal is declared — a tab switch, a back navigation, a deep link —
        // there may never be a scroll event to trigger it. Play it now instead
        // of leaving it at opacity 0 waiting for something that won't happen.
        const triggerEl = (options.trigger ?? els[0]) as Element;
        const playNow =
          options.immediate === true ||
          triggerEl.getBoundingClientRect().top < window.innerHeight;

        gsap.fromTo(
          els,
          { opacity: 0, y: options.y ?? REVEAL.y, scale: options.scale ?? 1 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: options.duration ?? REVEAL.duration,
            stagger: options.stagger ?? 0,
            delay: options.delay ?? 0,
            ease: REVEAL.ease,
            clearProps: 'opacity,transform',
            scrollTrigger: playNow
              ? undefined
              : {
                  trigger: options.trigger ?? els[0],
                  start: options.start ?? REVEAL.start,
                  once: true,
                },
          },
        );
      };

      build(reveal);
    }, scope);

    return () => ctx.revert();
    // `build` is intentionally excluded — callers pass an inline closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
