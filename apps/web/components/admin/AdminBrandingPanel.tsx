'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { siteSettingsApi, ApiError, SocialLinkDto } from '../../lib/api';

const MAX_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 Mo — largement suffisant pour un logo
const PLATFORM_OPTIONS = ['facebook', 'instagram', 'youtube', 'linkedin', 'twitter', 'tiktok', 'whatsapp'];

export function AdminBrandingPanel() {
  const { token } = useAuth();

  // --- Logo ---
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Titre d'accueil ---
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroMessage, setHeroMessage] = useState<string | null>(null);

  // --- Réseaux sociaux ---
  const [socialLinks, setSocialLinks] = useState<SocialLinkDto[]>([]);
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialMessage, setSocialMessage] = useState<string | null>(null);

  const load = () => {
    siteSettingsApi
      .get()
      .then((s) => {
        setLogoUrl(s.logoUrl);
        setHeroTitle(s.heroTitle ?? '');
        setHeroSubtitle(s.heroSubtitle ?? '');
        setSocialLinks(s.socialLinks ?? []);
      })
      .catch(() => {});
  };

  useEffect(load, []);

  // --- Logo handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoMessage(null);
    if (!file.type.startsWith('image/')) {
      setLogoMessage("Ce fichier n'est pas une image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLogoMessage('Fichier trop volumineux (1,5 Mo maximum). Essayez une image plus légère.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (!token || !preview) return;
    setLogoSaving(true);
    setLogoMessage(null);
    try {
      await siteSettingsApi.update(token, { logoUrl: preview });
      setLogoUrl(preview);
      setPreview(null);
      setLogoMessage('✓ Logo mis à jour — visible immédiatement sur tout le site.');
    } catch (err) {
      setLogoMessage(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setLogoSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!token) return;
    if (!confirm('Retirer le logo actuel et revenir au symbole par défaut ?')) return;
    setLogoSaving(true);
    setLogoMessage(null);
    try {
      await siteSettingsApi.update(token, { logoUrl: null });
      setLogoUrl(null);
      setPreview(null);
      setLogoMessage('✓ Logo retiré — le symbole par défaut est réaffiché.');
    } catch (err) {
      setLogoMessage(err instanceof ApiError ? err.message : 'Échec de la suppression.');
    } finally {
      setLogoSaving(false);
    }
  };

  const displayImage = preview ?? logoUrl;

  // --- Hero handlers ---
  const handleSaveHero = async () => {
    if (!token) return;
    setHeroSaving(true);
    setHeroMessage(null);
    try {
      await siteSettingsApi.update(token, {
        heroTitle: heroTitle.trim() || null,
        heroSubtitle: heroSubtitle.trim() || null,
      });
      setHeroMessage('✓ Texte d’accueil mis à jour — visible immédiatement.');
    } catch (err) {
      setHeroMessage(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setHeroSaving(false);
    }
  };

  // --- Social links handlers ---
  const addSocialLink = () => {
    setSocialLinks((links) => [...links, { platform: 'facebook', url: '' }]);
  };
  const updateSocialLink = (index: number, patch: Partial<SocialLinkDto>) => {
    setSocialLinks((links) => links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };
  const removeSocialLink = (index: number) => {
    setSocialLinks((links) => links.filter((_, i) => i !== index));
  };
  const handleSaveSocial = async () => {
    if (!token) return;
    setSocialSaving(true);
    setSocialMessage(null);
    try {
      const cleaned = socialLinks.filter((l) => l.url.trim());
      await siteSettingsApi.update(token, { socialLinks: cleaned });
      setSocialLinks(cleaned);
      setSocialMessage('✓ Réseaux sociaux mis à jour — visibles immédiatement dans le pied de page.');
    } catch (err) {
      setSocialMessage(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSocialSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Contenu de l&rsquo;accueil</h2>
      </div>

      {/* --- Titre d'accueil --- */}
      <div className="tc-card" style={{ maxWidth: 560 }}>
        <h4 style={{ marginBottom: 4 }}>Titre &amp; sous-titre de la page d&rsquo;accueil</h4>
        <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 16 }}>
          Le grand titre affiché en haut du site. Laisser vide pour revenir au texte par défaut.
        </p>
        <div className="field">
          <label>Titre principal</label>
          <input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Enseignons la bible autrement." />
        </div>
        <div className="field">
          <label>Sous-titre</label>
          <textarea rows={2} value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
        </div>
        {heroMessage && (
          <p style={{ fontSize: 13, marginBottom: 10, color: heroMessage.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{heroMessage}</p>
        )}
        <button className="btn btn-primary btn-sm" disabled={heroSaving} onClick={handleSaveHero}>
          {heroSaving ? 'Enregistrement…' : 'Enregistrer le texte'}
        </button>
      </div>

      {/* --- Logo --- */}
      <div className="tc-card" style={{ maxWidth: 560 }}>
        <h4 style={{ marginBottom: 4 }}>Logo du site</h4>
        <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 16 }}>
          Remplace le symbole par défaut sur l&rsquo;accueil, le pied de page et les espaces connectés.
          Format carré, fond transparent (PNG), 1,5 Mo max. Aucun service externe requis.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 90, height: 90, borderRadius: 16, border: '1.5px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              background: 'var(--gray-50)', flexShrink: 0,
            }}
          >
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'center', padding: 8 }}>
                Aucun logo — symbole par défaut
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
              📎 {logoUrl || preview ? 'Choisir une autre image' : 'Choisir une image'}
            </button>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            {logoUrl && !preview && (
              <button className="btn btn-ghost btn-sm" disabled={logoSaving} onClick={handleRemoveLogo}>
                Retirer le logo
              </button>
            )}
          </div>
        </div>

        {preview && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" disabled={logoSaving} onClick={handleSaveLogo}>
              {logoSaving ? 'Enregistrement…' : 'Enregistrer ce logo'}
            </button>
            <button className="btn btn-ghost btn-sm" disabled={logoSaving} onClick={() => setPreview(null)}>
              Annuler
            </button>
          </div>
        )}

        {logoMessage && (
          <p style={{ fontSize: 13, color: logoMessage.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{logoMessage}</p>
        )}
      </div>

      {/* --- Réseaux sociaux --- */}
      <div className="tc-card" style={{ maxWidth: 560 }}>
        <h4 style={{ marginBottom: 4 }}>Réseaux sociaux</h4>
        <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 16 }}>
          Affichés dans le pied de page du site. N&rsquo;ajoutez que ceux que vous utilisez réellement.
        </p>

        {socialLinks.map((link, i) => (
          <div key={i} className="tc-inline-form" style={{ marginTop: i === 0 ? 0 : 8 }}>
            <select value={link.platform} onChange={(e) => updateSocialLink(i, { platform: e.target.value })}>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <input
              placeholder="https://facebook.com/sthecroh"
              value={link.url}
              onChange={(e) => updateSocialLink(i, { url: e.target.value })}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button type="button" className="admin-icon-btn danger" onClick={() => removeSocialLink(i)}>🗑</button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addSocialLink}>
            + Ajouter un réseau social
          </button>
          <button className="btn btn-primary btn-sm" disabled={socialSaving} onClick={handleSaveSocial}>
            {socialSaving ? 'Enregistrement…' : 'Enregistrer les réseaux sociaux'}
          </button>
        </div>

        {socialMessage && (
          <p style={{ fontSize: 13, marginTop: 10, color: socialMessage.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{socialMessage}</p>
        )}
      </div>
    </div>
  );
}
