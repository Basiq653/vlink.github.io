import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type { AuthMode } from '../types';
import { useReveal, prefersReducedMotion } from '../lib/useReveal';

const STATS = [
  { num: '10K+', label: 'Пользователей' },
  { num: '50K+', label: 'Ссылок' },
  { num: '99.9%', label: 'Аптайм' },
];

export default function HeroSection({ onAuthOpen }: { onAuthOpen: (mode: AuthMode) => void }) {
  const ref = useRef<HTMLElement | null>(null);
  useReveal(ref, { selector: '.hero-animate', y: 28, stagger: 0.12 });

  return (
    <section
      ref={ref}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 24px 40px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="aurora" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div style={{ maxWidth: 720, position: 'relative' }}>
        <div
          className="hero-animate"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 100,
            background: 'rgba(79, 158, 255, 0.08)',
            border: '1px solid rgba(79, 158, 255, 0.2)',
            fontSize: '0.8rem',
            color: 'var(--blue)',
            marginBottom: 28,
            fontWeight: 500,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--blue)',
              animation: 'pulse 2s ease infinite',
              display: 'inline-block',
            }}
          />
          Бесплатно · Навсегда
        </div>

        <h1
          className="hero-animate"
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 24,
            background: 'linear-gradient(120deg, #6db3ff 20%, var(--purple) 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Все ваши ссылки в одном месте
        </h1>

        <p
          className="hero-animate"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--muted)',
            maxWidth: 540,
            margin: '0 auto 40px',
            lineHeight: 1.65,
          }}
        >
          Создайте персональную страницу, добавьте все ваши соцсети, проекты и контакты — и делитесь одной ссылкой.
        </p>

        <div
          className="hero-animate"
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={() => onAuthOpen('register')}
            style={{
              padding: '13px 28px',
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              animation: prefersReducedMotion() ? undefined : 'glowPulse 3s ease infinite',
            }}
          >
            Создать страницу
            <ArrowRight size={18} />
          </button>
          <Link
            to="/links"
            className="btn-ghost"
            style={{ padding: '13px 28px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            Смотреть пример
            <ExternalLink size={16} />
          </Link>
        </div>

        <div
          className="hero-animate"
          style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 40, borderTop: '1px solid var(--border)' }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center', minWidth: 96 }}>
              <div
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  background: 'var(--gradient-brand)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.num}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
