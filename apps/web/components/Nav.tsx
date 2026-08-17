'use client';

import { useEffect, useState } from 'react';
import { useUI } from '../lib/ui-context';
import { useAuth } from '../lib/auth-context';
import { siteSettingsApi } from '../lib/api';

const LINKS = [
  { href: '#presentation', label: 'Notre mission' },
  { href: '#formations', label: 'Formations' },
  { href: '#plateforme', label: 'Plateforme' },
  { href: '#cours', label: 'Cours' },
  { href: '#dons', label: 'Dons' },
  { href: '#certificats', label: 'Certificats' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme, openModal, showToast } = useUI();
  const { user, logout, loading } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    siteSettingsApi.get().then((s) => setLogoUrl(s.logoUrl)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    showToast('Vous avez été déconnecté.');
  };

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="container">
        <a href="#top" className="brand">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="STHECROH" className="brand-logo-img" />
          ) : (
            <span className="brand-mark" />
          )}
          <span>
            STHECROH
            <small>Séminaire Théologique</small>
          </span>
        </a>

        <ul className={`nav-links${open ? ' open' : ''}`} id="navLinks">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          <li className="only-mobile">
            {user ? (
              <button className="btn btn-ghost btn-sm btn-block" onClick={handleLogout}>
                Déconnexion
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-sm btn-block"
                onClick={() => {
                  setOpen(false);
                  openModal('login');
                }}
              >
                Se connecter
              </button>
            )}
          </li>
        </ul>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            id="themeToggle"
            title="Changer le thème"
            aria-label="Changer le thème"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!loading && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
            <a href="/admin" className="btn btn-ghost btn-sm" style={{ marginRight: 4 }}>
              Administration
            </a>
          ) : null}

          {!loading && user && (user.role === 'STUDENT' || user.role === 'TEACHER') ? (
            <a href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginRight: 4 }}>
              Mon espace
            </a>
          ) : null}

          {!loading && user ? (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              title={user.email}
            >
              {user.firstName} · Déconnexion
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => openModal('login')}>
              Se connecter
            </button>
          )}

          <button
            className="burger"
            id="burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
