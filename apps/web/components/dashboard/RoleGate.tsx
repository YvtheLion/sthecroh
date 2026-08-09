'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';

function InlineLoginForm({ hint }: { hint: string }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password, needs2FA ? twoFactorCode : undefined);
      if (result.requiresTwoFactor) setNeeds2FA(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 380, textAlign: 'left' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 6, textAlign: 'center' }}>
        Espace connecté
      </h2>
      <p style={{ color: 'var(--text-soft)', fontSize: 13.5, marginBottom: 24, textAlign: 'center' }}>{hint}</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Adresse e-mail</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@sthecroh.edu" />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {needs2FA && (
          <div className="field">
            <label>Code de double authentification</label>
            <input type="text" required value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="123456" maxLength={6} />
          </div>
        )}
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Connexion…' : needs2FA ? 'Vérifier le code' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

/**
 * Protège une page selon un ou plusieurs rôles autorisés.
 * Affiche : un loader, sinon un formulaire de connexion, sinon un message si le rôle ne correspond pas,
 * sinon le contenu protégé.
 */
export function RoleGate({
  allow,
  hint,
  children,
}: {
  allow: string[];
  hint: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-guard">
        <p style={{ color: 'var(--text-soft)' }}>Chargement…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-guard">
        <InlineLoginForm hint={hint} />
      </div>
    );
  }

  if (!allow.includes(user.role)) {
    return (
      <div className="admin-guard">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 12 }}>Accès réservé</h2>
          <p style={{ color: 'var(--text-soft)' }}>
            Votre compte ({user.email}) n&rsquo;a pas accès à cette section.{' '}
            <a href="/dashboard" style={{ color: 'var(--royal-2)', fontWeight: 600 }}>
              Aller à mon espace →
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
