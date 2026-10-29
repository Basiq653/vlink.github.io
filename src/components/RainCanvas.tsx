import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/useReveal';

interface Drop {
  x: number;
  tail: number;
  head: number;
  speed: number;
  opacity: number;
}

const TINTS = ['79, 158, 255', '150, 200, 255', '123, 94, 167'];

/**
 * Calm diagonal light streaks on a 2D canvas.
 * - pauses while the tab is hidden
 * - disabled entirely for users who prefer reduced motion
 * - scales with device pixel ratio (capped at 2)
 */
export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let drops: Drop[] = [];

    const spawn = (): Drop => ({
      x: Math.random() * 140 - 20,
      tail: Math.random() * 240,
      head: Math.random() * (window.innerHeight + 240),
      speed: 4.5 + Math.random() * 5.5,
      opacity: 0.1 + Math.random() * 0.16,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.round(window.innerWidth / 14), 64);
      drops = Array.from({ length: count }, spawn);
    };

    const skipTime = () => {
      let last = performance.now();
      return {
        tick: (now: number) => {
          const dt = now - last;
          last = now;
          return dt / 16.6;
        },
      };
    };
    const clock = skipTime();

    const frame = (now: number) => {
      if (!running) return;
      const k = clock.tick(now);
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.head += d.speed * k;
        if (d.head - d.tail > h + 60) drops[i] = { ...d, head: -40 - Math.random() * 200, x: Math.random() * 140 - 20 };

        const tint = TINTS[i % TINTS.length];
        const grad = ctx.createLinearGradient(d.x - d.tail, d.head - d.tail, d.x, d.head);
        grad.addColorStop(0, `rgba(${tint}, 0)`);
        grad.addColorStop(1, `rgba(${tint}, ${d.opacity})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(d.x - d.tail, d.head - d.tail);
        ctx.lineTo(d.x, d.head);
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
