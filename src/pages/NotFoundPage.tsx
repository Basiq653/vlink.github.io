import { Link } from 'react-router-dom';

export default function NotFoundPage() {
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
      <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
        Страница не найдена
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 420, marginBottom: 40, lineHeight: 1.6 }}>
        Похоже, этой страницы не существует или она была перемещена.
      </p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '13px 28px', fontSize: '1rem' }}>
        Вернуться на главную
      </Link>
    </div>
  );
}
