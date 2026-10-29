import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Newspaper, Send } from 'lucide-react';
import { useReveal } from '../lib/useReveal';

const ARTICLES = [
  {
    id: 1,
    title: 'Как создать идеальную страницу ссылок',
    desc: 'Пошаговое руководство по настройке вашей персональной страницы: от выбора цветовой схемы до размещения контента.',
    category: 'Гайды',
    date: '15 января 2025',
    image: './article-1.jpg',
  },
  {
    id: 2,
    title: 'Топ-10 советов для роста аудитории',
    desc: 'Узнайте, как эффективно использовать страницу ссылок для привлечения новых подписчиков и клиентов.',
    category: 'Маркетинг',
    date: '10 января 2025',
    image: './article-2.jpg',
  },
  {
    id: 3,
    title: 'Новые виджеты и интеграции 2025',
    desc: 'Обзор новых возможностей: музыкальный плеер, формы обратной связи и аналитика в реальном времени.',
    category: 'Обновления',
    date: '5 января 2025',
    image: './article-3.jpg',
  },
];

const TAGS = ['Гайды', 'Маркетинг', 'Дизайн', 'Обновления', 'Советы', 'Интеграции'];

export default function ArticlesPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  useReveal(ref, { selector: '.article-animate', y: 24, stagger: 0.09 });

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div
      ref={ref}
      style={{ minHeight: '100vh', padding: '100px 24px 40px', position: 'relative', zIndex: 1 }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64, paddingTop: 40 }}>
          <div className="article-animate">
            <div className="section-tag">
              <Newspaper size={14} />
              Блог
            </div>
          </div>
          <h1
            className="article-animate"
            style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--text)' }}
          >
            Статьи и новости
          </h1>
          <p
            className="article-animate"
            style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: 600, lineHeight: 1.6 }}
          >
            Полезные материалы, обновления платформы и советы по использованию Vlink.
          </p>
        </div>

        <div
          className="articles-layout"
          style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {ARTICLES.map((article) => (
              <article
                key={article.id}
                className="article-animate glass-card"
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                tabIndex={0}
              >
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                </div>
                <div style={{ padding: 20 }}>
                  <div
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 100, background: 'rgba(79, 158, 255, 0.1)', fontSize: '0.75rem', color: 'var(--blue)', marginBottom: 10, fontWeight: 500 }}
                  >
                    {article.category}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: 'var(--text)', lineHeight: 1.3 }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
                    {article.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{article.date}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--blue)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      Читать
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="article-animate" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: 'var(--text)' }}>
                Популярные теги
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TAGS.map((tag) => (
                  <button key={tag} type="button" className="tag-chip">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="article-animate" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: 8, color: 'var(--text)' }}>
                Подписка
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                Получайте новости и обновления на email.
              </p>
              {subscribed ? (
                <div
                  role="status"
                  style={{ padding: 12, borderRadius: 10, background: 'rgba(29, 233, 182, 0.1)', border: '1px solid rgba(29, 233, 182, 0.25)', color: 'var(--teal)', fontSize: '0.85rem', textAlign: 'center' }}
                >
                  Спасибо за подписку!
                </div>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      aria-label="Email для подписки"
                      required
                      className="field-input"
                      style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
                    />
                    <button type="submit" className="btn-primary" aria-label="Подписаться" style={{ padding: '10px 14px', display: 'inline-flex', alignItems: 'center' }}>
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
