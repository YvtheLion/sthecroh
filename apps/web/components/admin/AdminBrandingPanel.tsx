'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { siteSettingsApi, ApiError } from '../../lib/api';
import { FileUploadButton } from '../dashboard/FileUploadButton';

export function AdminBrandingPanel() {
  const { token } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    siteSettingsApi.get().then((s) => setLogoUrl(s.logoUrl)).catch(() => {});
  };

  useEffect(load, []);

  const handleUploaded = async (url: string) => {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      await siteSettingsApi.update(token, { logoUrl: url });
      setLogoUrl(url);
      setMessage('✓ Logo mis à jour — visible immédiatement sur tout le site.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!token) return;
    if (!confirm('Retirer le logo actuel et revenir au symbole par défaut ?')) return;
    setSaving(true);
    setMessage(null);
    try {
      await siteSettingsApi.update(token, { logoUrl: null });
      setLogoUrl(null);
      setMessage('✓ Logo retiré — le symbole par défaut est réaffiché.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Échec de la suppression.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Logo du site</h2>
      </div>

      <div className="tc-card" style={{ maxWidth: 480 }}>
        <p style={{ fontSize: 13.5, color: 'var(--text-soft)', marginBottom: 18 }}>
          Ce logo remplace le symbole par défaut sur la page d&rsquo;accueil, le pied de page, et la
          barre de navigation des espaces connectés (étudiant, enseignant, admin). Format recommandé :
          carré, fond transparent (PNG ou SVG), au moins 128×128 px.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 16,
              border: '1.5px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              background: 'var(--gray-50)',
              flexShrink: 0,
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo actuel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'center', padding: 8 }}>
                Aucun logo — symbole par défaut affiché
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <FileUploadButton label={logoUrl ? '📎 Remplacer le logo' : '📎 Téléverser un logo'} accept="image/*" onUploaded={handleUploaded} />
            {logoUrl && (
              <button className="btn btn-ghost btn-sm" disabled={saving} onClick={handleRemove}>
                Retirer le logo
              </button>
            )}
          </div>
        </div>

        {message && (
          <p style={{ fontSize: 13, color: message.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{message}</p>
        )}
      </div>
    </div>
  );
}
