import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/useReveal';

export type ProfileEffect =
  | 'none' | 'rain' | 'snow' | 'stars' | 'aurora' | 'night'
  | 'confetti' | 'fireflies' | 'bubbles';

function hexToHue(hex: string): number {
  const t = hex.replace('#', '');
  const r = (parseInt(t.slice(0, 2), 16) || 79) / 255;
  const g = (parseInt(t.slice(2, 4), 16) || 158) / 255;
  const b = (parseInt(t.slice(4, 6), 16) || 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return h * 360;
}

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
}

interface Raindrop {
  x: number;
  y: number;
  tail: number;
  head: number;
  speed: number;
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

interface Confetto {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  rotSpeed: number;
  vy: number;
  sway: number;
  phase: number;
  hueOff: number;
  opacity: number;
}

interface Firefly {
  x: number;
  y: number;
  r: number;
  angle: number;
  turn: number;
  speed: number;
  phase: number;
  opacity: number;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  phase: number;
  wobble: number;
  opacity: number;
}

/**
 * Фоновые эффекты публичной страницы профиля (rain / snow / stars).
 * Холст рисуется под контентом и не ловит клики.
 */
export default function ProfileFX({
  kind,
  color,
  preview = false,
}: {
  kind: ProfileEffect;
  color?: string;
  /** true — канвас занимает родителя (position:absolute), для мини-превью в дашборде */
  preview?: boolean;
}) {
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
    const baseHue = hexToHue(color || '#4f9eff');

    let raf = 0;
    let running = true;
    let flakes: Snowflake[] = [];
    let stars: Star[] = [];
    let blobs: Blob[] = [];
    let drops: Raindrop[] = [];
    let confetti: Confetto[] = [];
    let flies: Firefly[] = [];
    let bubbles: Bubble[] = [];

    const spawnDrop = (w: number, h: number): Raindrop => ({
      x: Math.random() * (w + 80) - 40,
      y: 0,
      tail: (preview ? 10 : 22) + Math.random() * (preview ? 22 : 90),
      head: Math.random() * h,
      speed: 3.2 + Math.random() * 4.4,
      opacity: 0.14 + Math.random() * 0.3,
    });

    const resize = () => {
      const rect = preview
        ? canvas.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (kind === 'snow') {
        const count = Math.min(Math.round(w / 12), preview ? 40 : 90);
        flakes = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (preview ? 0.8 : 1.5) + Math.random() * 2.2,
          speed: 0.4 + Math.random() * 1.1,
          drift: 8 + Math.random() * 26,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.35 + Math.random() * 0.5,
        }));
      } else if (kind === 'rain') {
        const count = preview ? 26 : Math.min(Math.round(w / 10), 80);
        drops = Array.from({ length: count }, () => spawnDrop(w, h));
      } else if (kind === 'stars' || kind === 'night') {
        const count = Math.min(Math.round((w * h) / (preview ? 5000 : 12000)), preview ? 50 : 160);
        stars = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (preview ? 0.5 : 0.6) + Math.random() * 1.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2,
          opacity: 0.3 + Math.random() * 0.55,
        }));
      } else if (kind === 'aurora') {
        blobs = [
          { x: w * 0.25, y: h * 0.35, vx: 0.5, vy: -0.3, r: w * 0.38, hue: 215 },
          { x: w * 0.75, y: h * 0.3, vx: -0.4, vy: 0.35, r: w * 0.34, hue: 275 },
          { x: w * 0.5, y: h * 0.8, vx: 0.32, vy: 0.4, r: w * 0.36, hue: 165 },
        ];
      } else if (kind === 'confetti') {
        const count = Math.min(Math.round(w / (preview ? 26 : 14)), preview ? 22 : 90);
        confetti = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          w: (preview ? 3 : 4) + Math.random() * (preview ? 4 : 6),
          h: (preview ? 5 : 7) + Math.random() * (preview ? 5 : 9),
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.18,
          vy: (preview ? 0.7 : 1.2) + Math.random() * (preview ? 1 : 1.8),
          sway: (preview ? 0.4 : 0.8) + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          hueOff: -55 + Math.random() * 110,
          opacity: 0.55 + Math.random() * 0.45,
        }));
      } else if (kind === 'fireflies') {
        const count = Math.min(Math.round((w * h) / (preview ? 9000 : 22000)), preview ? 14 : 48);
        flies = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (preview ? 1.1 : 1.4) + Math.random() * 1.6,
          angle: Math.random() * Math.PI * 2,
          turn: (Math.random() - 0.5) * 0.08,
          speed: (preview ? 0.35 : 0.5) + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.35 + Math.random() * 0.5,
        }));
      } else if (kind === 'bubbles') {
        const count = Math.min(Math.round(w / (preview ? 34 : 42)), preview ? 10 : 42);
        bubbles = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (preview ? 2 : 2.5) + Math.random() * (preview ? 4 : 8),
          vy: (preview ? 0.5 : 0.7) + Math.random() * (preview ? 0.7 : 1.1),
          phase: Math.random() * Math.PI * 2,
          wobble: 0.4 + Math.random() * 1.2,
          opacity: 0.3 + Math.random() * 0.4,
        }));
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const t = now / 1000;
      const rect = preview
        ? canvas.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
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
      } else if (kind === 'rain') {
        // косые светящиеся струйки
        ctx.lineWidth = 1.2;
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          d.head += d.speed;
          if (d.head - d.tail > h + 60) drops[i] = { ...d, head: -20 - Math.random() * 60, x: Math.random() * (w + 80) - 40 };
          const grad = ctx.createLinearGradient(d.x - d.tail, d.head - d.tail, d.x, d.head);
          grad.addColorStop(0, `rgba(${rgb}, 0)`);
          grad.addColorStop(1, `rgba(${rgb}, ${d.opacity})`);
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(d.x - d.tail, d.head - d.tail);
          ctx.lineTo(d.x, d.head);
          ctx.stroke();
        }
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
      } else if (kind === 'confetti') {
        for (let i = 0; i < confetti.length; i++) {
          const c = confetti[i];
          c.y += c.vy;
          c.x += Math.sin(t * c.sway + c.phase) * c.sway * 0.6;
          c.rot += c.rotSpeed;
          if (c.y > h + 14) {
            confetti[i] = { ...c, y: -14, x: Math.random() * w };
          }
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rot);
          ctx.globalAlpha = c.opacity;
          ctx.fillStyle = `hsl(${(baseHue + c.hueOff + 360) % 360}, 85%, 62%)`;
          ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      } else if (kind === 'fireflies') {
        ctx.globalCompositeOperation = 'lighter';
        for (const f of flies) {
          f.angle += f.turn + Math.sin(t * 0.7 + f.phase) * 0.03;
          f.x += Math.cos(f.angle) * f.speed;
          f.y += Math.sin(f.angle) * f.speed;
          // мягкий разворот, чтобы не улетали за край
          if (f.x < 10) f.angle = Math.PI - f.angle;
          if (f.x > w - 10) f.angle = Math.PI - f.angle;
          if (f.y < 10) f.angle = -f.angle;
          if (f.y > h - 10) f.angle = -f.angle;
          const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + f.phase);
          ctx.globalAlpha = f.opacity * pulse;
          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 4);
          grad.addColorStop(0, `hsla(${baseHue}, 90%, 70%, 0.9)`);
          grad.addColorStop(0.35, `hsla(${baseHue}, 90%, 62%, 0.35)`);
          grad.addColorStop(1, `hsla(${baseHue}, 90%, 62%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      } else if (kind === 'bubbles') {
        for (const b of bubbles) {
          b.y -= b.vy;
          b.phase += 0.02;
          const x = b.x + Math.sin(t * b.wobble + b.phase) * (b.wobble * 4);
          if (b.y < -b.r * 2) {
            b.y = h + b.r * 2;
            b.x = Math.random() * w;
          }
          ctx.globalAlpha = b.opacity;
          ctx.strokeStyle = `rgba(${rgb}, 0.8)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
          ctx.stroke();
          // блик — дуга слева сверху
          ctx.globalAlpha = b.opacity * 0.9;
          ctx.beginPath();
          ctx.arc(x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.55, Math.PI * 0.95, Math.PI * 1.45);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
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
    if (!preview) window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (!preview) window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [kind, color, preview]);

  if (kind === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: preview ? 'absolute' : 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: preview ? 0 : 0,
        pointerEvents: 'none',
      }}
    />
  );
}
