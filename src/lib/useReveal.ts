import { useEffect, type RefObject } from 'react';

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
 * Плавное появление элементов при попадании во вьюпорт.
 * IntersectionObserver + CSS transition (без GSAP):
 * - элементы, уже во вьюпорте, показываются сразу каскадом;
 * - страховочный таймер в 3.5 с показывает всё, даже если
 *   наблюдатель по какой-то причине не сработал.
 */
export function useReveal(
  containerRef: RefObject<HTMLElement | null>,
  options: RevealOptions,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const elements = Array.from(container.querySelectorAll<HTMLElement>(options.selector));
    if (elements.length === 0) return;

    if (prefersReducedMotion()) return; // ничего не прячем

    const y = options.y ?? 24;
    const duration = options.duration ?? 0.55;
    const stagger = (options.stagger ?? 0.08) * 1000;
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

    elements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px)`;
    });

    const reveal = (el: HTMLElement, delay: number) => {
      el.style.transition = `opacity ${duration}s ${easing} ${delay}ms, transform ${duration}s ${easing} ${delay}ms`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };

    let batchCount = 0;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => elements.indexOf(a) - elements.indexOf(b));

        visible.forEach((el, i) => {
          reveal(el, i * stagger);
          io.unobserve(el);
        });
        batchCount += 1;
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    elements.forEach((el) => io.observe(el));

    // страховка: если наблюдатель не отработал — показать всё
    const fallback = window.setTimeout(() => {
      elements.forEach((el, i) => reveal(el, Math.min(i * 40, 400)));
      io.disconnect();
    }, 3500);

    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
      elements.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        el.style.transitionDelay = '';
      });
    };
  }, [containerRef.current, options.selector]);
}
