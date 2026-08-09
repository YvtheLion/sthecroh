'use client';

import { useEffect, useState } from 'react';
import { verificationApi, VerificationResult, ApiError } from '../lib/api';

export function VerificationPage({ token }: { token: string }) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationApi
      .verify(token)
      .then(setResult)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Vérification impossible.'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <a href="/" className="brand" style={{ justifyContent: 'center', marginBottom: 28 }}>
          <span className="brand-mark" style={{ width: 30, height: 30 }} />
          STHECROH
        </a>

        {loading ? (
          <p style={{ color: 'var(--text-soft)' }}>Vérification en cours…</p>
        ) : error || !result ? (
          <>
            <div className="verify-icon bad">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" width={30} height={30}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 8 }}>
              Document introuvable
            </h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>
              {error ?? "Ce code ne correspond à aucun certificat ou diplôme émis par STHECROH."}
            </p>
          </>
        ) : (
          <>
            <div className={`verify-icon ${result.valid ? 'ok' : 'bad'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width={30} height={30}>
                {result.valid ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 6 }}>
              {result.valid
                ? result.type === 'certificate'
                  ? 'Certificat authentique'
                  : 'Diplôme authentique'
                : 'Document révoqué'}
            </h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>
              Émis par le Séminaire Théologique STHECROH.
            </p>

            <div className="verify-details">
              <div className="verify-row">
                <span>Titulaire</span>
                <span>{result.record.user.firstName} {result.record.user.lastName}</span>
              </div>
              <div className="verify-row">
                <span>{result.type === 'certificate' ? 'Programme' : 'Diplôme'}</span>
                <span>{result.type === 'certificate' ? result.record.title : result.record.program?.name}</span>
              </div>
              {result.type === 'certificate' && result.record.courseName && (
                <div className="verify-row">
                  <span>Cours</span>
                  <span>{result.record.courseName}</span>
                </div>
              )}
              {result.type === 'diploma' && result.record.mention && (
                <div className="verify-row">
                  <span>Mention</span>
                  <span>{result.record.mention}</span>
                </div>
              )}
              <div className="verify-row">
                <span>Identifiant</span>
                <span>{result.type === 'certificate' ? result.record.certificateNo : result.record.diplomaNo}</span>
              </div>
              <div className="verify-row">
                <span>Délivré le</span>
                <span>{new Date(result.record.issuedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="verify-row">
                <span>Statut</span>
                <span className={result.valid ? '' : ''} style={{ color: result.valid ? 'var(--success)' : 'var(--danger)' }}>
                  {result.valid ? 'Valide' : 'Révoqué'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
