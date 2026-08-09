'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { certificatesIssueApi, contentApi, request, ApiError } from '../../lib/api';

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function AdminCertificatesPanel() {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);

  const [certStudentId, setCertStudentId] = useState('');
  const [certTitle, setCertTitle] = useState('');
  const [certCourseName, setCertCourseName] = useState('');
  const [certSaving, setCertSaving] = useState(false);
  const [certMessage, setCertMessage] = useState<string | null>(null);

  const [dipStudentId, setDipStudentId] = useState('');
  const [dipProgramId, setDipProgramId] = useState('');
  const [dipMention, setDipMention] = useState('');
  const [dipSaving, setDipSaving] = useState(false);
  const [dipMessage, setDipMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    request<StudentOption[]>('/users?role=STUDENT', { token }).then(setStudents).catch(() => setStudents([]));
    contentApi.programs().then((list) => setPrograms(list.map((p) => ({ id: p.id, name: p.name })))).catch(() => {});
  }, [token]);

  const issueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !certStudentId || !certTitle.trim()) return;
    setCertSaving(true);
    setCertMessage(null);
    try {
      await certificatesIssueApi.issueCertificate(token, {
        userId: certStudentId,
        title: certTitle.trim(),
        courseName: certCourseName.trim() || undefined,
      });
      setCertMessage('✓ Certificat émis avec succès.');
      setCertTitle('');
      setCertCourseName('');
    } catch (err) {
      setCertMessage(err instanceof ApiError ? err.message : 'Émission impossible.');
    } finally {
      setCertSaving(false);
    }
  };

  const issueDiploma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !dipStudentId || !dipProgramId) return;
    setDipSaving(true);
    setDipMessage(null);
    try {
      await certificatesIssueApi.issueDiploma(token, {
        userId: dipStudentId,
        programId: dipProgramId,
        mention: dipMention.trim() || undefined,
      });
      setDipMessage('✓ Diplôme émis avec succès.');
      setDipMention('');
    } catch (err) {
      setDipMessage(err instanceof ApiError ? err.message : 'Émission impossible.');
    } finally {
      setDipSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Certificats &amp; diplômes</h2>
      </div>

      <div className="tc-card">
        <h4 style={{ marginBottom: 14 }}>Émettre un certificat</h4>
        <form onSubmit={issueCertificate}>
          <div className="admin-form-grid">
            <div className="field full">
              <label>Étudiant</label>
              <select value={certStudentId} onChange={(e) => setCertStudentId(e.target.value)} required>
                <option value="">— Sélectionner —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Titre du certificat</label>
              <input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} required placeholder="Ex. Théologie systématique I" />
            </div>
            <div className="field">
              <label>Nom du cours (optionnel)</label>
              <input value={certCourseName} onChange={(e) => setCertCourseName(e.target.value)} placeholder="Ex. Théologie systématique I" />
            </div>
          </div>
          {certMessage && <p style={{ fontSize: 13, marginTop: 8, color: certMessage.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{certMessage}</p>}
          <button className="btn btn-primary btn-sm" type="submit" disabled={certSaving} style={{ marginTop: 14 }}>
            {certSaving ? 'Émission…' : 'Émettre le certificat'}
          </button>
        </form>
      </div>

      <div className="tc-card">
        <h4 style={{ marginBottom: 14 }}>Émettre un diplôme</h4>
        <form onSubmit={issueDiploma}>
          <div className="admin-form-grid">
            <div className="field">
              <label>Étudiant</label>
              <select value={dipStudentId} onChange={(e) => setDipStudentId(e.target.value)} required>
                <option value="">— Sélectionner —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Programme</label>
              <select value={dipProgramId} onChange={(e) => setDipProgramId(e.target.value)} required>
                <option value="">— Sélectionner —</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Mention (optionnel)</label>
              <input value={dipMention} onChange={(e) => setDipMention(e.target.value)} placeholder="Ex. Mention Bien" />
            </div>
          </div>
          {dipMessage && <p style={{ fontSize: 13, marginTop: 8, color: dipMessage.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{dipMessage}</p>}
          <button className="btn btn-primary btn-sm" type="submit" disabled={dipSaving} style={{ marginTop: 14 }}>
            {dipSaving ? 'Émission…' : 'Émettre le diplôme'}
          </button>
        </form>
      </div>
    </div>
  );
}
