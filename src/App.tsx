import { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { loadState, saveState } from './store';
import type { FactoryState } from './store';
import { t } from './engine/i18n';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import PoDetail from './pages/PoDetail';
import Passport from './pages/Passport';
import Method from './pages/Method';
import Evidence from './pages/Evidence';

export default function App() {
  const [state, setState] = useState<FactoryState>(() => loadState());
  const loc = useLocation();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleLang = () => {
    const lang = state.lang === 'en' ? 'bn' : 'en';
    setState((s) => ({ ...s, lang }));
  };

  const onPassportPage = loc.pathname.startsWith('/pp');

  return (
    <div className="shell">
      {!onPassportPage && (
        <header className="nav">
          <Link to="/" className="brand">
            <span className="brand-mark">প</span>
            <span>{t('appName', state.lang)}</span>
            <span className="brand-sub">DPP-in-a-Box</span>
          </Link>
          <nav className="navlinks">
            <NavLink to="/app">{t('dashboard', state.lang)}</NavLink>
            <NavLink to="/evidence">{t('evidence', state.lang)}</NavLink>
            <NavLink to="/method">{t('method', state.lang)}</NavLink>
            <button className="lang-btn" onClick={toggleLang} aria-label="toggle language">
              {state.lang === 'en' ? 'বাংলা' : 'EN'}
            </button>
          </nav>
        </header>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Landing lang={state.lang} />} />
          <Route path="/app" element={<Dashboard state={state} setState={setState} />} />
          <Route path="/app/upload" element={<Upload state={state} setState={setState} />} />
          <Route path="/app/po/:id" element={<PoDetail state={state} setState={setState} />} />
          <Route path="/pp" element={<Passport state={state} setState={setState} />} />
          <Route path="/method" element={<Method />} />
          <Route path="/evidence" element={<Evidence />} />
        </Routes>
      </main>
      {!onPassportPage && (
        <footer className="footer">
          <span>
            Porichoy (পরিচয়) v2.0 — DPP schema v0.1 · local-first pilot ·{' '}
            <a href="https://github.com/rudra496/porichoy" target="_blank" rel="noreferrer">GitHub</a>
          </span>
          <span className="footer-dim">
            16 Crossref-verified studies · facts sourced live · Built for Needle Innovation Challenge 3.0 · {new Date().getFullYear()}
          </span>
        </footer>
      )}
    </div>
  );
}
