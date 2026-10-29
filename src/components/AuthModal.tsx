import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import type { AuthMode } from '../types';
import { prefersReducedMotion } from '../lib/useReveal';

interface AuthModalProps {
  mode: 'login' | 'register';
  onSwitchMode: (mode: AuthMode) => void;
  onClose: () => void;
}

export default function AuthModal({ mode, onSwitchMode, onClose }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus the first field on open and restore focus on close.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    firstFieldRef.current?.focus();
    return () => previouslyFocused.current?.focus();
  }, [mode]);

  // A simple focus trap: Tab cycles inside the modal.
  useEffect(() => {
    const container = document.getElementById('vlink-auth-dialog');
    if (!container) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = container.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.');
      return;
    }
    setSubmitting(true);
    // Демо-режим: замена на реальный вызов API при подключении бэкенда.
    window.setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 1200);
  };

  const switchMode = () => {
    setError('');
    onSwitchMode(isLogin ? 'register' : 'login');
  };

  const fade = prefersReducedMotion() ? undefined : 'fadeUp 0.35s ease both';

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 24px',
        background: 'rgba(6, 10, 20, 0.8)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        id="vlink-auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={isLogin ? 'Вход' : 'Регистрация'}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border-hover)',
          borderRadius: 20,
          padding: 40,
          width: '100%',
          maxWidth: 420,
          animation: fade,
          position: 'relative',
          boxShadow: '0 24px 64px rgba(2, 6, 14, 0.6)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 6, borderRadius: 8, lineHeight: 0 }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 32 }}>
          {isLogin ? 'Войдите в свой аккаунт Vlink' : 'Создайте бесплатный аккаунт'}
        </p>

        {error && (
          <div role="alert" style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: 'var(--red)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="auth-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text)' }}>
                Имя
              </label>
              <input
                ref={firstFieldRef}
                id="auth-name"
                className="field-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="auth-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text)' }}>
              Email
            </label>
            <input
              ref={isLogin ? firstFieldRef : undefined}
              id="auth-email"
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="auth-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text)' }}>
              Пароль
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-password"
                className="field-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={6}
                required
                style={isLogin ? undefined : { paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                aria-pressed={showPassword}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0, lineHeight: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: 12, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {submitting && (
              <span
                aria-hidden="true"
                style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}
              />
            )}
            {isLogin ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            type="button"
            onClick={switchMode}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
}
