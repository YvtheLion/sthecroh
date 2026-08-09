'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { certificatesApi, CertificateDto, DiplomaDto, ApiError } from '../../lib/api';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function CertificatesView() {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState<CertificateDto[] | null>(null);
  const [diplomas, setDiplomas] = useState<DiplomaDto[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    certificatesApi.mine(token).then(setCertificates).catch(() => setCertificates([]));
    certificatesApi.myDiplomas(token).then(setDiplomas).catch(() => setDiplomas([]));
  }, [token]);

  const downloadCertificate = async (cert: CertificateDto) => {
    if (!token) return;
    setDownloadingId(cert.id);
    setError(null);
    try {
      const blob = await certificatesApi.downloadCertificatePdf(token, cert.id);
      triggerDownload(blob, `certificat-${cert.certificateNo}.pdf`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Téléchargement impossible.');
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadDiploma = async (dip: DiplomaDto) => {
    if (!token) return;
    setDownloadingId(dip.id);
    setError(null);
    try {
      const blob = await certificatesApi.downloadDiplomaPdf(token, dip.id);
      triggerDownload(blob, `diplome-${dip.diplomaNo}.pdf`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Téléchargement impossible.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      <div className="course-header">
        <h1>Mes certificats &amp; diplômes</h1>
        <p>Téléchargez vos documents officiels, vérifiables publiquement via QR code.</p>
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 18, marginBottom: 14 }}>
        Certificats
      </h3>
      <div className="admin-table-wrap" style={{ marginBottom: 28 }}>
        {!certificates ? (
          <div className="admin-empty">Chargement…</div>
        ) : certificates.length === 0 ? (
          <div className="admin-empty">Aucun certificat obtenu pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Identifiant</th>
                <th>Délivré le</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.certificateNo}</td>
                  <td>{new Date(c.issuedAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`pill ${c.revoked ? 'warn' : 'ok'}`}>{c.revoked ? 'Révoqué' : 'Valide'}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" disabled={downloadingId === c.id} onClick={() => downloadCertificate(c)}>
                      {downloadingId === c.id ? 'Génération…' : 'Télécharger le PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 18, marginBottom: 14 }}>
        Diplômes
      </h3>
      <div className="admin-table-wrap">
        {!diplomas ? (
          <div className="admin-empty">Chargement…</div>
        ) : diplomas.length === 0 ? (
          <div className="admin-empty">Aucun diplôme délivré pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Identifiant</th>
                <th>Mention</th>
                <th>Délivré le</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {diplomas.map((d) => (
                <tr key={d.id}>
                  <td>{d.diplomaNo}</td>
                  <td>{d.mention ?? '—'}</td>
                  <td>{new Date(d.issuedAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`pill ${d.revoked ? 'warn' : 'ok'}`}>{d.revoked ? 'Révoqué' : 'Valide'}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" disabled={downloadingId === d.id} onClick={() => downloadDiploma(d)}>
                      {downloadingId === d.id ? 'Génération…' : 'Télécharger le PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
