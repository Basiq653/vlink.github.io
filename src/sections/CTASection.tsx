import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import type { AuthMode } from '../types';
import { useReveal, prefersReducedMotion } from '../lib/useReveal';

export default function CTASection({ onAuthOpen }: { onAuthOpen: (mode: AuthMode) => void }) {
  const ref = useRef<HTMLElement | null>(null);
  useReveal(ref, { selector: '.cta-animate', y: 24, stagger: 0.1 });

  return (
    <section ref={ref} style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border-hover)',
            borderRadius: 24,
            padding: '64px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(79, 158, 255, 0.12) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              className="cta-animate"
              style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--text)' }}
            >
              Готовы начать?
            </h2>
            <p
              className="cta-animate"
              style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.6 }}
            >
              Создайте свою страницу за пару минут и начните делиться всеми ссылками в одном месте.
            </p>
            <button
              type="button"
              className="cta-animate btn-primary"
              onClick={() => onAuthOpen('register')}
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                animation: prefersReducedMotion() ? undefined : 'glowPulse 3s ease infinite',
              }}
            >
              Создать бесплатную страницу
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
