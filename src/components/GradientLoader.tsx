import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/useReveal';

/**
 * Small animated canvas used on the boot screen: a slowly orbiting
 * aurora with two sweeping light arcs. Static frame for reduced motion.
 */
export default function GradientLoader({ size }: { size: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const center = size / 2;
    const radius = size * 0.4;
    const start = Date.now();

    let raf = 0;
    let running = false;

    const draw = (fast: boolean) => {
      const t = fast ? 1.6 : (Date.now() - start) / 1000;
      ctx.clearRect(0, 0, size, size);

      const glow = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius * 1.25);
      glow.addColorStop(0, 'rgba(79, 158, 255, 0.22)');
      glow.addColorStop(1, 'rgba(79, 158, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center, center, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      const wobble = 0.5 + 0.5 * Math.sin(t * 2);
      const orb = ctx.createRadialGradient(
        center - radius * 0.2,
        center + radius * 0.25,
        0,
        center - radius * 0.2,
        center + radius * 0.25,
        radius * wobble,
      );
      orb.addColorStop(0, 'rgba(255, 191, 72, 0.45)');
      orb.addColorStop(0.4, 'rgba(190, 74, 29, 0.25)');
      orb.addColorStop(0.75, 'rgba(123, 94, 167, 0.18)');
      orb.addColorStop(1, 'rgba(79, 158, 255, 0)');
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(t * Math.PI * 0.5);
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.85, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.strokeStyle = 'rgba(124, 178, 255, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    };

    const frame = () => {
      if (!running) return;
      draw(false);
      raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      draw(true); // one static frame, no animation loop
    } else {
      running = true;
      raf = requestAnimationFrame(frame);
      const onVisibility = () => {
        if (document.hidden) {
          running = false;
          cancelAnimationFrame(raf);
        } else if (!running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);
      return () => {
        running = false;
        cancelAnimationFrame(raf);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }

    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
}
