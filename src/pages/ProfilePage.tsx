import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, MapPin, Music4 } from 'lucide-react';
import { fetchProfileByUsername, APPEARANCE_FALLBACK, type Profile } from '../lib/profiles';
import { fetchLinkCards, type LinkCard } from '../lib/linkCards';
import { useReveal } from '../lib/useReveal';
import ProfileFX, { type ProfileEffect } from '../components/ProfileFX';
import RainCanvas from '../components/RainCanvas';

export default function ProfilePage() {
  const { username = '' } = useParams();
  const ref = useRef<HTMLDivElement | null>(null);
  useReveal(ref, { selector: '.profile-animate', y: 24, stagger: 0.08 });

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<LinkCard[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setState('loading');
      const found = await fetchProfileByUsername(username);
      if (canceled) return;
      if (!found) {
        setState('notfound');
        return;
      }
      const { cards: all } = await fetchLinkCards();
      if (canceled) return;
      setProfile(found);
      setCards(all.filter((card) => card.user_id === found.id));
      setState('ready');
      document.title = `${found.display_name || found.username} (@${found.username}) — Vlink`;
    };
    load();
    return () => { canceled = true; };
  }, [username]);

  // фон страницы (подложка под overscroll) в цвет профиля
  useEffect(() => {
    if (!profile) return;
    const prev = document.body.style.background;
    document.body.style.background = profile.bg_color || '#080c14';
    return () => { document.body.style.background = prev; };
  }, [profile?.bg_color]);

  // пользовательский курсор
  useEffect(() => {
    if (!profile?.cursor_url) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = `url(${profile.cursor_url}) 0 0, auto`;
    return () => { document.body.style.cursor = prev; };
  }, [profile?.cursor_url]);

  if (state === 'loading') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', position: 'relative', zIndex: 1 }}>
        Загрузка…
      </div>
    );
  }

  if (state === 'notfound' || !profile) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 24px 60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="section-tag">404</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: 16 }}>
          Профиль не найден
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 420, marginBottom: 40, lineHeight: 1.6 }}>
          Пользователя <b>@{username}</b> не существует, либо он скрыл свою страницу.
        </p>
        <Link to="/links" className="btn-primary" style={{ textDecoration: 'none', padding: '13px 28px', fontSize: '1rem' }}>
          Смотреть каталог ссылок
        </Link>
      </div>
    );
  }

  const ap = {
    ...APPEARANCE_FALLBACK,
    description: profile.description ?? '',
    avatar_url: profile.avatar_url ?? '',
    background_url: profile.background_url ?? '',
    audio_url: profile.audio_url ?? '',
    bg_effect: (profile.bg_effect ?? 'none') as ProfileEffect,
    bg_opacity: typeof profile.bg_opacity === 'number' ? profile.bg_opacity : 100,
    bg_blur: typeof profile.bg_blur === 'number' ? profile.bg_blur : 0,
    location: profile.location ?? '',
    accent_color: profile.accent_color || APPEARANCE_FALLBACK.accent_color,
    text_color: profile.text_color || APPEARANCE_FALLBACK.text_color,
    bg_color: profile.bg_color || APPEARANCE_FALLBACK.bg_color,
    icons_color: profile.icons_color || APPEARANCE_FALLBACK.icons_color,
  };
  const displayName = profile.display_name || profile.username;
  const hasBg = !!ap.background_url;
  // карточка контента: полупрозрачный тёмный фон поверх картинки
  const contentBg = hasBg
    ? `rgba(8, 12, 20, ${Math.max(0.25, ap.bg_opacity / 100)})`
    : ap.bg_color;

  return (
    <div ref={ref} style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* фон: картинка под размытием + цвет-подложка */}
      {hasBg && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: `url(${ap.background_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${ap.bg_blur}px)`,
            transform: ap.bg_blur > 0 ? 'scale(1.05)' : undefined,
            zIndex: -2,
          }}
        />
      )}

      {/* эффекты */}
      {ap.bg_effect === 'rain'
        ? <RainCanvas />
        : <ProfileFX kind={ap.bg_effect} color={ap.accent_color} />}

      {/* hero + карточки */}
      <div
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '140px 24px 60px',
        }}
      >
        <div
          className="profile-animate"
          style={{
            maxWidth: 440,
            width: '100%',
            background: contentBg,
            border: `1px solid ${ap.accent_color}33`,
            borderRadius: 28,
            padding: '40px 36px 36px',
            textAlign: 'center',
            backdropFilter: hasBg ? 'blur(8px)' : undefined,
            WebkitBackdropFilter: hasBg ? 'blur(8px)' : undefined,
            color: ap.text_color,
            boxShadow: `0 30px 80px rgba(0, 0, 0, 0.45)`,
          }}
        >
          {/* аватар */}
          {ap.avatar_url ? (
            <img
              src={ap.avatar_url}
              alt=""
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                objectFit: 'cover',
                margin: '0 auto 24px',
                display: 'block',
                border: `3px solid ${ap.accent_color}`,
                boxShadow: `0 12px 40px ${ap.accent_color}55`,
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${ap.accent_color}, ${ap.icons_color})`,
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-head)',
                fontSize: '2.4rem',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}

          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 5vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 6, color: ap.text_color }}>
            {displayName}
          </h1>
          <p style={{ color: ap.accent_color, fontSize: '0.95rem', fontWeight: 500, marginBottom: ap.description ? 14 : 24 }}>
            @{profile.username}
          </p>

          {ap.description && (
            <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: ap.text_color, opacity: 0.8, marginBottom: 20 }}>
              {ap.description}
            </p>
          )}

          {ap.location && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 100,
                background: `${ap.accent_color}1a`,
                border: `1px solid ${ap.accent_color}33`,
                color: ap.text_color,
                fontSize: '0.8rem',
                marginBottom: 24,
              }}
            >
              <MapPin size={13} color={ap.icons_color} />
              {ap.location}
            </div>
          )}

          {/* карточки ссылок */}
          {cards.length === 0 ? (
            <p style={{ fontSize: '0.95rem', color: ap.text_color, opacity: 0.6 }}>
              Пользователь пока не добавил ссылок.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cards.map((card) => (
                <a
                  key={card.id}
                  href={card.url}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-animate"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '15px 20px',
                    textDecoration: 'none',
                    borderRadius: 16,
                    background: `${ap.accent_color}14`,
                    border: `1px solid ${ap.accent_color}2b`,
                    transition: 'transform 0.15s ease, background 0.15s ease',
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.5rem', flexShrink: 0 }}>{card.icon}</span>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: ap.text_color }}>
                      {card.title}
                    </span>
                    {card.description && (
                      <span style={{ display: 'block', fontSize: '0.8rem', color: ap.text_color, opacity: 0.6, marginTop: 2 }}>
                        {card.description}
                      </span>
                    )}
                  </span>
                  <ExternalLink size={16} color={ap.icons_color} style={{ flexShrink: 0 }} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* аудио плеер */}
      {ap.audio_url && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(8, 12, 20, 0.85)',
            border: `1px solid ${ap.accent_color}44`,
            borderRadius: 14,
            padding: '10px 12px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Music4 size={16} color={ap.icons_color} style={{ flexShrink: 0 }} />
          <audio
            src={ap.audio_url}
            controls
            loop
            style={{ height: 34, maxWidth: 240 }}
          />
        </div>
      )}

      {/* footer band */}
      <div style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', color: ap.text_color, opacity: 0.55, fontSize: '0.85rem' }}>
          Страница создана с{' '}
          <Link to="/" style={{ color: ap.accent_color, textDecoration: 'none', fontWeight: 500 }}>
            Vlink
          </Link>
        </div>
      </div>
    </div>
  );
}
