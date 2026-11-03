import { useEffect, useState } from 'react';
import GradientLoader from './GradientLoader';

/**
 * Стартовая заставка в стиле liquid glass: стеклянная плитка с логотипом V,
 * живое свечение позади, слово VLINK с пробегающим светом и заполняющийся
 * прогресс. Повторным посетителям сессии и reduced-motion — короткая вспышка.
 */
export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visibleMs = reduced ? 350 : 1700;
    let fadeTimer: number;
    const doneTimer = window.setTimeout(() => {
      setFading(true);
      fadeTimer = window.setTimeout(onComplete, 520);
    }, visibleMs);
    return () => {
      window.clearTimeout(doneTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  return (
    <div
      aria-label="Загрузка"
      role="status"
      className={`boot-screen boot-aura${fading ? ' done' : ''}`}
    >
      {/* стеклянная плитка с логотипом и живым свечением */}
      <div className="boot-tile">
        <GradientLoader size={160} />
        <svg className="boot-v" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="bootVGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4f9eff" />
              <stop offset="1" stopColor="#b06ef7" />
            </linearGradient>
          </defs>
          <path
            d="M40.5 22v10.8c0 6-4.1 9.8-10.3 9.8s-10.3-3.8-10.3-9.8V22h4.6V32c0 3 1.8 4.9 4.6 4.9 2.8 0 4.6-1.9 4.6-4.9V22h4.8l6.4-4z"
            fill="url(#bootVGrad)"
            stroke="url(#bootVGrad)"
          />
        </svg>
      </div>

      {/* слово-логотип */}
      <div className="boot-word" data-word="VLINK">
        VLINK
      </div>

      {/* прогресс */}
      <div className="boot-bar" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
