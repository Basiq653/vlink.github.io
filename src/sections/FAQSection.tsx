import { useRef, useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import { useReveal } from '../lib/useReveal';

const FAQ = [
  {
    q: 'Это действительно бесплатно?',
    a: 'Да! Все базовые функции Vlink абсолютно бесплатны. Вы можете создать страницу, добавить неограниченное количество ссылок и кастомизировать внешний вид без каких-либо платежей.',
  },
  {
    q: 'Нужно ли уметь программировать?',
    a: 'Нет, совсем не нужно. Vlink создан для всех — от блогеров до разработчиков. Интуитивно понятный интерфейс позволит настроить страницу за пару минут.',
  },
  {
    q: 'Можно ли использовать свой домен?',
    a: 'Да, в будущих обновлениях мы добавим возможность подключения собственного домена. Сейчас каждый пользователь получает уникальную ссылку на нашем домене.',
  },
  {
    q: 'Как долго хранятся ссылки?',
    a: 'Ссылки хранятся бессрочно. Если вы не удаляете свой аккаунт, все данные останутся на месте. Мы гарантируем 99.9% аптайм.',
  },
  {
    q: 'Есть ли мобильное приложение?',
    a: 'На данный момент Vlink работает через веб-браузер и полностью адаптирован для мобильных устройств. Приложение для iOS и Android находится в разработке.',
  },
];

export default function FAQSection() {
  const ref = useRef<HTMLElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  useReveal(ref, { selector: '.faq-animate', y: 24, stagger: 0.09 });

  return (
    <section
      ref={ref}
      id="faq"
      style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}
    >
      <div
        className="faq-layout"
        style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 48, alignItems: 'start' }}
      >
        <div className="faq-header-col" style={{ position: 'sticky', top: 100 }}>
          <div className="faq-animate">
            <div className="section-tag">
              <CircleHelp size={14} />
              FAQ
            </div>
          </div>
          <h2
            className="faq-animate"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--text)' }}
          >
            Частые вопросы
          </h2>
          <p className="faq-animate" style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            Ответы на самые популярные вопросы о Vlink.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.q}
                className="faq-animate"
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${open ? 'var(--border-hover)' : 'var(--border)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${index}`}
                  id={`faq-button-${index}`}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: 16,
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    color="var(--muted)"
                    style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                  />
                </button>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  style={{ maxHeight: open ? 260 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}
                >
                  <div style={{ padding: '0 24px 20px', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.65 }}>
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
