import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { fetchProfileByUsername, type Profile } from '../lib/profiles';
import { fetchLinkCards, type LinkCard } from '../lib/linkCards';
import { useReveal } from '../lib/useReveal';

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
    };
    load();
    return () => { canceled = true; };
  }, [username]);

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

  const displayName = profile.display_name || profile.username;

  return (
    <div ref={ref} style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* hero */}
      <div style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '140px 24px 60px' }}>
        <div className="profile-animate" style={{ maxWidth: 480, width: '100%' }}>
          <div
            aria-hidden="true"
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-head)',
              fontSize: '2.4rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 12px 40px rgba(79, 158, 255, 0.35)',
            }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <h1
            style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 8 }}
          >
            {displayName}
          </h1>
          <p style={{ color: 'var(--blue)', fontSize: '0.95rem', fontWeight: 500, marginBottom: 28 }}>
            @{profile.username}
          </p>

          {/* карточки ссылок */}
          {cards.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              Пользователь пока не добавил ссылок.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420, margin: '0 auto' }}>
              {cards.map((card) => (
                <a
                  key={card.id}
                  href={card.url}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-animate glass-card"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', textDecoration: 'none' }}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.5rem', flexShrink: 0 }}>{card.icon}</span>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                      {card.title}
                    </span>
                    {card.description && (
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                        {card.description}
                      </span>
                    )}
                  </span>
                  <ExternalLink size={16} color="var(--blue)" style={{ flexShrink: 0 }} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* footer band */}
      <div style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
          Страница создана с{' '}
          <Link to="/" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
            Vlink
          </Link>
        </div>
      </div>
    </div>
  );
}
