import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BootScreen from './components/BootScreen';
import RainCanvas from './components/RainCanvas';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import LinksPage from './pages/LinksPage';
import NotFoundPage from './pages/NotFoundPage';
import type { AuthMode } from './types';

const SESSION_BOOT_KEY = 'vlink-booted';

export default function App() {
  const [booted, setBooted] = useState(
    () => sessionStorage.getItem(SESSION_BOOT_KEY) === '1',
  );
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const location = useLocation();

  const finishBoot = useCallback(() => {
    sessionStorage.setItem(SESSION_BOOT_KEY, '1');
    setBooted(true);
  }, []);

  const openAuth = useCallback((mode: AuthMode) => setAuthMode(mode), []);
  const closeAuth = useCallback(() => setAuthMode(null), []);

  // Scroll back to the top on every route change.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    document.title =
      authMode === 'login'
        ? 'Вход — Vlink'
        : authMode === 'register'
          ? 'Регистрация — Vlink'
          : 'Vlink — Все ваши ссылки в одном месте';
  }, [authMode]);

  // Close auth dialog with Escape.
  useEffect(() => {
    if (!authMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAuthMode(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [authMode]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>

      {!booted && <BootScreen onComplete={finishBoot} />}

      {booted && (
        <>
          <RainCanvas />
          <Navigation onAuthOpen={openAuth} />
          <main
            id="main-content"
            style={{ position: 'relative', zIndex: 1, outline: 'none' }}
          >
            <Routes>
              <Route path="/" element={<HomePage onAuthOpen={openAuth} />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/links" element={<LinksPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          {authMode && <AuthModal mode={authMode} onSwitchMode={setAuthMode} onClose={closeAuth} />}
        </>
      )}
    </>
  );
}
