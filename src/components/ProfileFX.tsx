import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/useReveal';

export type ProfileEffect = 'none' | 'rain' | 'snow' | 'stars' | 'aurora' | 'night';

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  opacity: number;
}

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
}

function makeBlobs(w: number, h: number): Blob[] {
  return [
    { x: w * 0.2, y: h * 0.3, vx: 0.35, vy: -0.22, r: w * 0.3, hue: 215 },
    { x: w * 0.75, y: h * 0.25, vx: -0.28, vy: 0.26, r: w * 0.26, hue: 275 },
    { x: w * 0.5, y: h * 0.75, vx: 0.22, vy: 0.3, r: w * 0.28, hue: 165 },
  ];
}

/**
 * Фоновые эффекты публичной страницы профиля (rain / snow / stars).
 * Холст рисуется под контентом и не ловит клики.
 */
export default function ProfileFX({ kind, color }: { kind: ProfileEffect; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (kind === 'none' || prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tint = (color || '#4f9eff').replace('#', '');
    const rgb = [
      parseInt(tint.slice(0, 2), 16) || 79,
      parseInt(tint.slice(2, 4), 16) || 158,
      parseInt(tint.slice(4, 6), 16) || 255,
    ].join(', ');

    let raf = 0;
    let running = true;
    let flakes: Snowflake[] = [];
    let stars: Star[] = [];
    let blobs: Blob[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = window.innerWidth;
      const h = window.innerHeight;

      if (kind === 'snow') {
        const count = Math.min(Math.round(window.innerWidth / 12), 90);
        flakes = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1.5 + Math.random() * 2.5,
          speed: 0.4 + Math.random() * 1.1,
          drift: 8 + Math.random() * 26,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.35 + Math.random() * 0.5,
        }));
      } else if (kind === 'stars' || kind === 'night') {
        const count = Math.min(Math.round((w * h) / 12000), 160);
        stars = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.3,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2,
          opacity: 0.3 + Math.random() * 0.55,
        }));
      } else if (kind === 'aurora') {
        blobs = makeBlobs(w, h);
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const t = now / 1000;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (kind === 'snow') {
        ctx.fillStyle = `rgba(${rgb}, 1)`;
        for (const f of flakes) {
          f.y += f.speed;
          f.phase += 0.01;
          if (f.y > h + 8) {
            f.y = -8;
            f.x = Math.random() * w;
          }
          const x = f.x + Math.sin(f.phase * f.drift * 0.05) * f.drift * 0.15;
          ctx.globalAlpha = f.opacity;
          ctx.beginPath();
          ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (kind === 'stars' || kind === 'night') {
        for (const s of stars) {
          const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
          ctx.globalAlpha = s.opacity * twinkle;
          ctx.fillStyle = `rgba(${rgb}, 1)`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (kind === 'night') {
          // ночная тень: темнее сверху донизу
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, 'rgba(2, 4, 10, 0.55)');
          grad.addColorStop(0.5, 'rgba(2, 4, 10, 0.25)');
          grad.addColorStop(1, 'rgba(2, 4, 10, 0.55)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      } else if (kind === 'aurora') {
        ctx.globalCompositeOperation = 'lighter';
        for (const b of blobs) {
          // блуждание по экрану с ограничением
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < b.r * 0.3 || b.x > w - b.r * 0.3) b.vx *= -1;
          if (b.y < b.r * 0.2 || b.y > h - b.r * 0.4) b.vy *= -1;

          const hue = b.hue + Math.sin(t * 0.3 + b.hue) * 18;
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          grad.addColorStop(0, `hsla(${hue}, 85%, 60%, 0.16)`);
          grad.addColorStop(1, `hsla(${hue}, 85%, 60%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
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
  }, [kind, color]);

  if (kind === 'none') return null;

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
