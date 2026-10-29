import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { ChartColumn, Music, Palette, Shield, Sparkles, Blocks } from 'lucide-react';
import { useReveal } from '../lib/useReveal';

const FEATURES = [
  { icon: Sparkles, title: 'Бесплатно навсегда', desc: 'Все базовые функции абсолютно бесплатны. Никаких скрытых платежей и подписок.' },
  { icon: Palette, title: 'Кастомизация', desc: 'Настройте внешний вид под себя: цвета, шрифты, фон и многое другое.' },
  { icon: ChartColumn, title: 'Статистика', desc: 'Отслеживайте клики, источники трафика и поведение аудитории в реальном времени.' },
  { icon: Shield, title: 'Безопасность', desc: 'SSL-шифрование, защита от спама и модерация контента.' },
  { icon: Music, title: 'Музыка', desc: 'Добавьте плеер с любимыми треками прямо на страницу.' },
  { icon: Blocks, title: 'Виджеты', desc: 'Интеграции с соцсетями, формы, опросы и другие виджеты.' },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLElement | null>(null);
  useReveal(ref, {
    selector: '.feature-head, .glass-card',
    triggerSelector: '.feature-head',
    y: 30,
    stagger: 0.07,
  });

  // Subtle card glow that follows the cursor.
  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * 100;
    const my = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${mx}%`);
    card.style.setProperty('--my', `${my}%`);
  };

  return (
    <section ref={ref} id="features" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="feature-head">
          <div className="section-tag">
            <Sparkles size={14} />
            Возможности
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              color: 'var(--text)',
            }}
          >
            Всё, что нужно для ваших ссылок
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: 480, lineHeight: 1.6, marginBottom: 60 }}>
            Мощный инструментарий для создания идеальной страницы со всеми вашими ссылками.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card"
                onMouseMove={handleMouseMove}
                style={{ padding: 28, cursor: 'default' }}
              >
                <div
                  aria-hidden="true"
                  className="card-glow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(79, 158, 255, 0.1) 0%, transparent 55%)',
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(79, 158, 255, 0.12)',
                    border: '1px solid rgba(79, 158, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    color: 'var(--blue)',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: 'var(--text)' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .glass-card:hover .card-glow {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}
