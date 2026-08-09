'use client';

import { useEffect, useState } from 'react';
import { emailVerificationApi, ApiError } from '../../../lib/api';

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    emailVerificationApi
      .verify(params.token)
      .then(() => setStatus('ok'))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Vérification impossible.');
        setStatus('error');
      });
  }, [params.token]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <a href="/" className="brand" style={{ justifyContent: 'center', marginBottom: 28 }}>
          <span className="brand-mark" style={{ width: 30, height: 30 }} />
          STHECROH
        </a>

        {status === 'loading' ? (
          <p style={{ color: 'var(--text-soft)' }}>Vérification en cours…</p>
        ) : status === 'ok' ? (
          <>
            <div className="verify-icon ok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width={30} height={30}>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 8 }}>
              E-mail confirmé ✓
            </h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 24 }}>
              Votre compte est maintenant actif. Vous pouvez vous connecter dès maintenant.
            </p>
            <a href="/" className="btn btn-primary btn-block" style={{ display: 'inline-flex' }}>
              Retour à l&rsquo;accueil
            </a>
          </>
        ) : (
          <>
            <div className="verify-icon bad">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" width={30} height={30}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 8 }}>
              Lien invalide
            </h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>{error}</p>
          </>
        )}
      </div>
    </div>
  );
}
