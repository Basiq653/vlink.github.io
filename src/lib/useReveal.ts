import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface RevealOptions {
  selector: string;
  triggerSelector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
}

/**
 * Reveals elements with a staggered fade-up as they scroll into view.
 * Triggers are attached inside a gsap.matchMedia context so they have
 * proper ownership and are cleaned up without killing animation
 * registrations belonging to other components.
 */
export function useReveal(
  containerRef: RefObject<HTMLElement | null>,
  options: RevealOptions,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        container.querySelectorAll(options.selector),
        { opacity: 0, y: options.y ?? 24 },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.6,
          stagger: options.stagger ?? 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: options.triggerSelector
              ? container.querySelector(options.triggerSelector)
              : container,
            start: options.start ?? 'top 80%',
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, [containerRef.current, options.selector, options.triggerSelector]);
}
