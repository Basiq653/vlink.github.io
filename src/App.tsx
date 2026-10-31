import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BootScreen from './components/BootScreen';
import RainCanvas from './components/RainCanvas';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useSupabaseUser } from './lib/useSupabaseUser';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import LinksPage from './pages/LinksPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import type { AuthMode } from './types';

const SESSION_BOOT_KEY = 'vlink-booted';

export default function App() {
  const [booted, setBooted] = useState(
    () => sessionStorage.getItem(SESSION_BOOT_KEY) === '1',
  );
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const { user, ready } = useSupabaseUser();
  const location = useLocation();

  const finishBoot = useCallback(() => {
    sessionStorage.setItem(SESSION_BOOT_KEY, '1');
    setBooted(true);
  }, []);

  const openAuth = useCallback((mode: AuthMode) => setAuthMode(mode), []);
  const closeAuth = useCallback(() => setAuthMode(null), []);

  // Skip the auth dialog as soon as the user is logged in.
  useEffect(() => {
    if (user && authMode) setAuthMode(null);
  }, [user, authMode]);

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

  const isProfileRoute = /^\/u\/[^/]+$/.test(location.pathname);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>

      {!booted && !isProfileRoute && <BootScreen onComplete={finishBoot} />}

      {(booted || isProfileRoute) && (
        <>
          {!isProfileRoute && <RainCanvas />}
          {!isProfileRoute && <Navigation user={user} ready={ready} onAuthOpen={openAuth} />}
          <main
            id="main-content"
            style={{ position: 'relative', zIndex: 1, outline: 'none' }}
          >
            <Routes>
              <Route path="/" element={<HomePage onAuthOpen={openAuth} />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/links" element={<LinksPage onAuthOpen={openAuth} />} />
              <Route path="/dashboard" element={<DashboardPage user={user} onAuthOpen={openAuth} />} />
              <Route path="/u/:username" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          {!isProfileRoute && <Footer />}
          {authMode && ready && <AuthModal mode={authMode} onSwitchMode={setAuthMode} onClose={closeAuth} />}
        </>
      )}
    </>
  );
}
