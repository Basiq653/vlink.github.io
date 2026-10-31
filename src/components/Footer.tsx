import { Link } from 'react-router-dom';

const CONTACT_TG = { label: 'Telegram', href: 'https://t.me/ffazak0?direct', icon: <TelegramIcon /> };

const SOCIALS = [
  CONTACT_TG,
  { label: 'X (Twitter)', href: 'https://x.com', icon: <TwitterIcon /> },
  { label: 'GitHub', href: 'https://github.com/Basiq653', icon: <GitHubIcon /> },
];

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.96.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.5 22H3.4l7.24-8.29L2.4 2h6.4l4.42 5.84L18.9 2Zm-1.1 18.13h1.72L7.9 3.77H6.05L17.8 20.13Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.94 4.3 18.6 19.85c-.25 1.1-.9 1.37-1.82.85l-5.03-3.7-2.42 2.33c-.27.27-.5.5-1.02.5l.36-5.12L18.24 6.1c.41-.36-.09-.56-.63-.2L5.79 13.06.83 11.5c-1.08-.34-1.1-1.08.23-1.6L20.7 3.06c.9-.33 1.68.2 1.24 1.24Z" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">VLINK</Link>
          <p className="footer-tagline">
            Персональная страница со всеми вашими соцсетями, проектами и контактами — одна ссылка на всё.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Навигация в подвале">
          <div>
            <div className="footer-title">Разделы</div>
            <Link to="/" className="footer-link">Главная</Link>
            <Link to="/articles" className="footer-link">Статьи</Link>
            <Link to="/links" className="footer-link">Ссылки</Link>
          </div>
          <div>
            <div className="footer-title">Контакты</div>
            <a href={CONTACT_TG.href} target="_blank" rel="noreferrer" className="footer-link" style={{ color: 'var(--blue)' }}>
              Telegram — @ffazak0
            </a>
            <a href="https://github.com/Basiq653" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
          </div>
        </nav>

        <div>
          <div className="footer-title">Соцсети</div>
          <div className="footer-socials">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                className="footer-social"
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} Vlink. Сделано с любовью.</span>
        <a href="#" rel="noreferrer" className="footer-link">Наверх ↑</a>
      </div>
    </footer>
  );
}
