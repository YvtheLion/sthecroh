'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { NotificationBell } from './NotificationBell';
import { siteSettingsApi } from '../../lib/api';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Étudiant',
  TEACHER: 'Enseignant',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export function AppTopbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    siteSettingsApi.get().then((s) => setLogoUrl(s.logoUrl)).catch(() => {});
  }, []);

  return (
    <div className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <a href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="STHECROH" className="brand-logo-img" style={{ width: 26, height: 26 }} />
          ) : (
            <span className="brand-mark" style={{ width: 26, height: 26 }} />
          )}
          STHECROH
        </a>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ fontSize: 13.5, color: 'var(--text-soft)' }}>{title}</span>
      </div>
      <div className="app-topbar-right">
        <a href="/" className="home-link">
          ← Retour au site
        </a>
        {user && (
          <>
            <NotificationBell />
            <span className="role-badge">{ROLE_LABELS[user.role] ?? user.role}</span>
            <span className="user-name">{user.firstName} {user.lastName}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Déconnexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
