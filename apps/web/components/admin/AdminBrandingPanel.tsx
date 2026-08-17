'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { siteSettingsApi, ApiError } from '../../lib/api';

const MAX_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 Mo — largement suffisant pour un logo

export function AdminBrandingPanel() {
  const { token } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    siteSettingsApi.get().then((s) => setLogoUrl(s.logoUrl)).catch(() => {});
  };

  useEffect(load, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);

    if (!file.type.startsWith('image/')) {
      setMessage("Ce fichier n'est pas une image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setMessage('Fichier trop volumineux (1,5 Mo maximum). Essayez une image plus légère.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!token || !preview) return;
    setSaving(true);
    setMessage(null);
    try {
      await siteSettingsApi.update(token, { logoUrl: preview });
      setLogoUrl(preview);
      setPreview(null);
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
      setPreview(null);
      setMessage('✓ Logo retiré — le symbole par défaut est réaffiché.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Échec de la suppression.');
    } finally {
      setSaving(false);
    }
  };

  const displayImage = preview ?? logoUrl;

  return (
    <div>
      <div className="admin-header">
        <h2>Logo du site</h2>
      </div>

      <div className="tc-card" style={{ maxWidth: 480 }}>
        <p style={{ fontSize: 13.5, color: 'var(--text-soft)', marginBottom: 18 }}>
          Ce logo remplace le symbole par défaut sur la page d&rsquo;accueil, le pied de page, et la
          barre de navigation des espaces connectés. Format recommandé : carré, fond transparent (PNG),
          1,5 Mo maximum. Aucun service externe n&rsquo;est nécessaire — l&rsquo;image est stockée
          directement sur la plateforme.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
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
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'center', padding: 8 }}>
                Aucun logo — symbole par défaut affiché
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
              📎 {logoUrl || preview ? 'Choisir une autre image' : 'Choisir une image'}
            </button>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            {logoUrl && !preview && (
              <button className="btn btn-ghost btn-sm" disabled={saving} onClick={handleRemove}>
                Retirer le logo
              </button>
            )}
          </div>
        </div>

        {preview && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleSave}>
              {saving ? 'Enregistrement…' : 'Enregistrer ce logo'}
            </button>
            <button className="btn btn-ghost btn-sm" disabled={saving} onClick={() => setPreview(null)}>
              Annuler
            </button>
          </div>
        )}

        {message && (
          <p style={{ fontSize: 13, color: message.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{message}</p>
        )}
      </div>
    </div>
  );
}
