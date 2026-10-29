import { useEffect, useState } from 'react';
import GradientLoader from './GradientLoader';

/**
 * Animated intro screen. Shows briefly, then fades out and reports
 * completion. Reduced-motion users and repeat session visitors see a
 * much shorter flash instead of a fixed 2.5 second wait.
 */
export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visibleMs = reduced ? 300 : 1500;
    let fadeTimer: number;
    const doneTimer = window.setTimeout(() => {
      setFading(true);
      fadeTimer = window.setTimeout(onComplete, 450);
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
      style={{
        position: 'fixed',
        inset: 0,
        background: '#060a14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        transition: 'opacity 0.45s ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          letterSpacing: '0.2em',
          fontFamily: 'var(--font-head)',
          background: 'var(--gradient-brand)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 28,
        }}
      >
        VLINK
      </div>
      <GradientLoader size={110} />
      <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              animation: 'bootDotPulse 1.2s ease infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
