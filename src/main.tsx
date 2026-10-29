import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// HashRouter keeps client-side routing working on GitHub Pages,
// where the site is served from a repository subpath (/vlink.github.io/).
// BrowserRouter without a basename rendered a blank page there.
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
