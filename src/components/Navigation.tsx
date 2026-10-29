import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import type { AuthMode, SectionLink } from '../types';

const LINKS: SectionLink[] = [
  { label: 'Главная', to: '/' },
  { label: 'Статьи', to: '/articles' },
  { label: 'Ссылки', to: '/links' },
];

export default function Navigation({ onAuthOpen }: { onAuthOpen: (mode: AuthMode) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  const linkStyle = (active: boolean) => ({
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: '0.9rem',
    color: active ? '#e9eef4' : 'var(--muted)',
    textDecoration: 'none',
    background: active && scrolled ? 'rgba(255,255,255,0.05)' : 'none',
    fontFamily: 'var(--font-body)',
    position: 'relative' as const,
  });

  return (
    <>
      <nav
        aria-label="Основная навигация"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.3s ease, border-color 0.3s ease',
          background: scrolled ? 'rgba(8, 12, 20, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <Link
          to="/"
          aria-label="Vlink — на главную"
          style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '0.02em',
            background: 'var(--gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textDecoration: 'none',
          }}
        >
          VLINK
        </Link>

        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={location.pathname === item.to ? 'page' : undefined}
              style={linkStyle(location.pathname === item.to)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onAuthOpen('login')}>
            Вход
          </button>
          <button type="button" className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onAuthOpen('register')}>
            Начать
          </button>
        </div>

        <button
          type="button"
          className="burger-btn"
          aria-expanded={open}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setOpen((v) => !v)}
          style={{ display: 'none', background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: '#e9eef4', borderRadius: 8 }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div
        className="mobile-menu"
        aria-hidden={!open}
        style={{
          display: open ? 'flex' : 'none',
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          zIndex: 99,
          background: 'rgba(8, 12, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: 16,
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: '0.95rem',
              color: location.pathname === item.to ? '#e9eef4' : 'var(--muted)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              background: location.pathname === item.to ? 'rgba(79, 158, 255, 0.12)' : 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ flex: 1, padding: 10 }}
            onClick={() => { onAuthOpen('login'); setOpen(false); }}
          >
            Вход
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 1, padding: 10 }}
            onClick={() => { onAuthOpen('register'); setOpen(false); }}
          >
            Начать
          </button>
        </div>
      </div>
    </>
  );
}
