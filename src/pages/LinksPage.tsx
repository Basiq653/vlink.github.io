import { useRef, useState } from 'react';
import { Search, Link2, ArrowRight } from 'lucide-react';
import { useReveal } from '../lib/useReveal';
import type { AuthMode } from '../types';

const ALL_LINKS = [
  { title: 'GitHub', desc: 'Мои репозитории и open-source проекты', category: 'Dev', icon: '💻', url: 'https://github.com' },
  { title: 'Twitter / X', desc: 'Мысли, обновления и общение', category: 'Social', icon: '🐦', url: 'https://x.com' },
  { title: 'Instagram', desc: 'Фото, сторис и жизнь', category: 'Social', icon: '📸', url: 'https://instagram.com' },
  { title: 'LinkedIn', desc: 'Профессиональный профиль', category: 'Social', icon: '💼', url: 'https://linkedin.com' },
  { title: 'YouTube', desc: 'Видео, туториалы и стримы', category: 'Social', icon: '🎬', url: 'https://youtube.com' },
  { title: 'Telegram', desc: 'Канал с новостями и обновлениями', category: 'Social', icon: '✈️', url: 'https://t.me' },
  { title: 'Dribbble', desc: 'Дизайн-проекты и портфолио', category: 'Design', icon: '🎨', url: 'https://dribbble.com' },
  { title: 'Behance', desc: 'Кейсы и креативные работы', category: 'Design', icon: '📐', url: 'https://behance.net' },
  { title: 'Spotify', desc: 'Плейлисты и любимая музыка', category: 'Other', icon: '🎵', url: 'https://spotify.com' },
  { title: 'Buy Me a Coffee', desc: 'Поддержать проект', category: 'Other', icon: '☕', url: 'https://buymeacoffee.com' },
  { title: 'Portfolio', desc: 'Личный сайт с проектами', category: 'Dev', icon: '🌐', url: '#' },
  { title: 'Blog', desc: 'Статьи о технологиях и дизайне', category: 'Dev', icon: '📝', url: '#' },
];

const CATEGORIES = ['All', 'Social', 'Dev', 'Design', 'Other'];

export default function LinksPage({ onAuthOpen }: { onAuthOpen: (mode: AuthMode) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  useReveal(ref, { selector: '.links-animate', y: 24, stagger: 0.06 });

  const filtered = ALL_LINKS.filter((link) => {
    const matchesCategory = category === 'All' || link.category === category;
    const q = query.toLowerCase();
    const matchesQuery =
      query.trim() === '' ||
      link.title.toLowerCase().includes(q) ||
      link.desc.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div ref={ref} style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div
        style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '130px 24px 60px' }}
      >
        <div style={{ maxWidth: 600 }}>
          <div className="links-animate">
            <div className="section-tag">
              <Link2 size={14} />
              Коллекция
            </div>
          </div>
          <h1
            className="links-animate"
            style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--text)' }}
          >
            Соберите все ваши ссылки
          </h1>
          <p
            className="links-animate"
            style={{ fontSize: '1.05rem', color: 'var(--muted)', marginBottom: 40, lineHeight: 1.6 }}
          >
            Профессиональная страница для всех ваших соцсетей, проектов и контактов.
          </p>

          <div className="links-animate" style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск ссылок…"
              aria-label="Поиск ссылок"
              className="field-input"
              style={{ padding: '14px 16px 14px 48px', borderRadius: 14, fontSize: '0.95rem' }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            className="links-animate"
            style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}
            role="tablist"
            aria-label="Категории ссылок"
          >
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 100,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    background: active ? 'rgba(79, 158, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                    color: active ? 'var(--blue)' : 'var(--muted)',
                    border: `1px solid ${active ? 'rgba(79, 158, 255, 0.35)' : 'var(--border)'}`,
                  }}
                >
                  {cat === 'All' ? 'Все' : cat}
                </button>
              );
            })}
          </div>

          <div
            className="links-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}
          >
            {filtered.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="links-animate glass-card"
                style={{ padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', textDecoration: 'none' }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(79, 158, 255, 0.1)',
                    border: '1px solid rgba(79, 158, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                  }}
                >
                  {link.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                      {link.title}
                    </h3>
                    <span
                      style={{ fontSize: '0.7rem', color: 'var(--blue)', background: 'rgba(79, 158, 255, 0.1)', padding: '2px 8px', borderRadius: 100, fontWeight: 500, flexShrink: 0 }}
                    >
                      {link.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{link.desc}</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Перейти
                    <ArrowRight size={12} />
                  </span>
                </div>
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Ничего не найдено</p>
              <p style={{ fontSize: '0.9rem' }}>Попробуйте изменить поисковый запрос или фильтр</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border-hover)',
              borderRadius: 24,
              padding: '48px 40px',
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
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>
                Хотите свою страницу?
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: 24 }}>
                Создайте бесплатный аккаунт и начните добавлять ссылки.
              </p>
              <button type="button" onClick={() => onAuthOpen('register')} className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Создать страницу
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
