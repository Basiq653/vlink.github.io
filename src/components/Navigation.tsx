import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import type { SessionUser } from '../lib/supabase';
import { signOut } from '../lib/useSupabaseUser';
import type { AuthMode, SectionLink } from '../types';

const LINKS: SectionLink[] = [
  { label: 'Главная', to: '/' },
  { label: 'Статьи', to: '/articles' },
  { label: 'Ссылки', to: '/links' },
];

const DASHBOARD_LINK: SectionLink = { label: 'Мои ссылки', to: '/dashboard' };

export default function Navigation({
  user,
  ready,
  onAuthOpen,
}: {
  user: SessionUser | null;
  ready: boolean;
  onAuthOpen: (mode: AuthMode) => void;
}) {
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
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 28px)',
          maxWidth: 1120,
          zIndex: 100,
          padding: '0 20px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          background: scrolled ? 'rgba(10, 15, 26, 0.65)' : 'rgba(10, 15, 26, 0.42)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 18,
          boxShadow: scrolled
            ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 40px rgba(2, 6, 14, 0.45)'
            : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 30px rgba(2, 6, 14, 0.25)',
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
          {(user ? [...LINKS, DASHBOARD_LINK] : LINKS).map((item) => (
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
          {ready && user ? (
            <>
              <span
                title={user.email}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: 'rgba(79, 158, 255, 0.1)',
                  border: '1px solid rgba(79, 158, 255, 0.2)',
                  color: 'var(--text)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', flexShrink: 0 }}
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                {user.name}
              </span>
              <button
                type="button"
                className="btn-ghost"
                aria-label="Выйти из аккаунта"
                onClick={() => signOut()}
                style={{ padding: '7px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <LogOut size={14} />
                Выйти
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onAuthOpen('login')}>
                Вход
              </button>
              <button type="button" className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => onAuthOpen('register')}>
                Начать
              </button>
            </>
          )}
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
          top: 86,
          left: 14,
          right: 14,
          zIndex: 99,
          background: 'rgba(10, 15, 26, 0.75)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 18,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 46px rgba(2, 6, 14, 0.5)',
          padding: 16,
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {(user ? [...LINKS, DASHBOARD_LINK] : LINKS).map((item) => (
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
          {ready && user ? (
            <button
              type="button"
              className="btn-ghost"
              style={{ flex: 1, padding: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => { signOut(); setOpen(false); }}
            >
              <LogOut size={16} />
              Выйти ({user.name})
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
