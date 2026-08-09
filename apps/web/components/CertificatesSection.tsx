'use client';

import { useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { useUI } from '../lib/ui-context';
import { verificationApi, VerificationResult, ApiError } from '../lib/api';

export function CertificatesSection() {
  const left = useReveal();
  const right = useReveal();
  const { openModal } = useUI();
  const [certInput, setCertInput] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    const no = certInput.trim();
    if (!no) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await verificationApi.verifyByNumber(no);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Vérification impossible.');
    } finally {
      setLoading(false);
      openModal('cert');
    }
  };

  return (
    <section id="certificats">
      <div className={`container cert-grid`}>
        <div ref={left.ref} className={left.className}>
          <div className="certificate">
            <div className="cert-seal">
              <span>
                SCEAU
                <br />
                OFFICIEL
              </span>
            </div>
            <div className="cert-eyebrow">Séminaire Théologique STHECROH</div>
            <div className="cert-title">Certificat de réussite</div>
            <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Ce document atteste que</p>
            <div className="cert-name">Jean-Baptiste Nkurunziza</div>
            <p className="cert-desc">
              a suivi avec succès le programme <b>Théologie Systématique I</b>, validé le 14 juin 2026 avec
              une moyenne de 91/100, conformément aux exigences académiques de l&rsquo;institution.
            </p>
            <div className="cert-foot">
              <div className="cert-sign">
                Directeur académique
                <b>Dr. Samuel Diarra</b>
              </div>
              <div className="qr-fake" title="QR de vérification" />
            </div>
          </div>
        </div>

        <div ref={right.ref} className={`cert-side ${right.className}`}>
          <div className="eyebrow">Certificats &amp; diplômes</div>
          <h3>Chaque diplôme, vérifiable en un instant.</h3>
          <p>
            Chaque certificat émis par STHECROH possède un identifiant unique et un QR code de vérification
            publique. Employeurs, églises et institutions peuvent confirmer son authenticité en quelques
            secondes.
          </p>
          <div className="verify-box">
            <input
              type="text"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              placeholder="Entrez l'identifiant du certificat — ex. STH-2026-0001"
            />
            <button className="btn btn-primary btn-sm" onClick={verify} disabled={loading}>
              {loading ? 'Recherche…' : 'Vérifier'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 10 }}>
            Astuce : essayez <b>STH-2026-0001</b>, l&rsquo;identifiant du certificat de démonstration.
          </p>
        </div>
      </div>

      <CertModalContent result={result} error={error} certInput={certInput} />
    </section>
  );
}

function CertModalContent({
  result,
  error,
  certInput,
}: {
  result: VerificationResult | null;
  error: string | null;
  certInput: string;
}) {
  const { modal, closeModal } = useUI();
  if (modal !== 'cert') return null;

  return (
    <div className="modal-overlay show" onClick={closeModal}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>
          ✕
        </button>

        {error || !result ? (
          <>
            <div className="check-circle" style={{ marginBottom: 14, background: 'linear-gradient(135deg,#e07a6f,#c04444)' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>
            <h3 style={{ textAlign: 'center' }}>Introuvable</h3>
            <p className="sub" style={{ textAlign: 'center' }}>
              {error ?? `Aucun document ne correspond à l'identifiant « ${certInput} ».`}
            </p>
          </>
        ) : (
          <>
            <div
              className="check-circle"
              style={{
                marginBottom: 14,
                background: result.valid ? undefined : 'linear-gradient(135deg,#e07a6f,#c04444)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                {result.valid ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
              </svg>
            </div>
            <h3 style={{ textAlign: 'center' }}>
              {result.valid ? (result.type === 'certificate' ? 'Certificat vérifié' : 'Diplôme vérifié') : 'Document révoqué'}
            </h3>
            <p className="sub" style={{ textAlign: 'center' }}>
              Identifiant <b>{result.type === 'certificate' ? result.record.certificateNo : result.record.diplomaNo}</b>
            </p>
            <div className="list-simple">
              <div className="row">
                <span>Titulaire</span>
                <b>{result.record.user.firstName} {result.record.user.lastName}</b>
              </div>
              <div className="row">
                <span>{result.type === 'certificate' ? 'Programme' : 'Diplôme'}</span>
                <b>{result.type === 'certificate' ? result.record.title : result.record.program?.name}</b>
              </div>
              <div className="row">
                <span>Date d&rsquo;obtention</span>
                <b>{new Date(result.record.issuedAt).toLocaleDateString('fr-FR')}</b>
              </div>
              <div className="row">
                <span>Statut</span>
                <span className={`pill ${result.valid ? 'ok' : 'warn'}`}>{result.valid ? 'Authentique' : 'Révoqué'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
