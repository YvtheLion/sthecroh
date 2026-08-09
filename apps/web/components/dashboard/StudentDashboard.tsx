'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { dashboardApi, submissionsApi, announcementsApi, StudentDashboardSummary, ApiError } from '../../lib/api';
import { FileUploadButton } from './FileUploadButton';

function BarChart({ data }: { data: { label: string; h: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    data.forEach((v) => {
      const col = document.createElement('div');
      col.className = 'col';
      const fill = document.createElement('div');
      fill.className = 'fill';
      fill.style.height = '0%';
      col.appendChild(fill);
      const span = document.createElement('span');
      span.textContent = v.label;
      col.appendChild(span);
      el.appendChild(col);
      requestAnimationFrame(() => setTimeout(() => (fill.style.height = v.h + '%'), 60));
    });
  }, [data]);

  return <div className="bar-chart" ref={ref} />;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

const STUDY_DATA = [
  { label: 'Lun', h: 40 },
  { label: 'Mar', h: 65 },
  { label: 'Mer', h: 50 },
  { label: 'Jeu', h: 80 },
  { label: 'Ven', h: 60 },
  { label: 'Sam', h: 30 },
  { label: 'Dim', h: 20 },
];

const NAV_ITEMS = [
  { key: 'overview', label: 'Tableau de bord', icon: '⌂', href: '/dashboard/student' },
  { key: 'progress', label: 'Mes notes', icon: '◔', href: '/dashboard/student/grades' },
  { key: 'payments', label: 'Paiements', icon: '$', href: '/dashboard/student/payments' },
  { key: 'certificates', label: 'Certificats', icon: '⚜', href: '/dashboard/student/certificates' },
  { key: 'library', label: 'Bibliothèque', icon: '📖', href: '/dashboard/student/library' },
  { key: 'messages', label: 'Messagerie', icon: '✉', href: '/dashboard/student/messages' },
  { key: 'settings', label: 'Paramètres', icon: '⚙', href: '#parametres' },
];

export function StudentDashboard({ firstName, lastName }: { firstName: string; lastName: string }) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; body: string; createdAt: string; course: { title: string } }[]>([]);

  const load = () => {
    if (!token) return;
    setLoading(true);
    dashboardApi
      .studentSummary(token)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
    announcementsApi.forMe(token).then(setAnnouncements).catch(() => setAnnouncements([]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmitAssignment = async (examId: string) => {
    if (!token || (!submissionText.trim() && !submissionFileUrl)) {
      setSubmitError('Ajoutez un message ou un fichier avant de remettre le devoir.');
      return;
    }
    try {
      await submissionsApi.submit(token, examId, {
        comment: submissionText.trim() || undefined,
        fileUrl: submissionFileUrl ?? undefined,
      });
      setSubmittingId(null);
      setSubmissionText('');
      setSubmissionFileUrl(null);
      setSubmitError(null);
      load();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Remise impossible.');
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        {NAV_ITEMS.map((item, i) => (
          <a key={item.key} href={item.href} className={`admin-nav-item${i === 0 ? ' active' : ''}`}>
            <span style={{ marginRight: 8 }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>

      <div className="admin-main">
        <div className="dash-welcome">Bonjour, {firstName} 👋</div>
        <div className="dash-sub">Voici un résumé réel de votre progression.</div>

        {loading || !summary ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement de vos données…</p>
        ) : (
          <>
            <div className="kpi-row">
              <Kpi label="Cours en cours" value={String(summary.kpis.coursesInProgress)} />
              <Kpi label="Progression moyenne" value={`${summary.kpis.averageProgress}%`} />
              <Kpi label="Devoirs à rendre" value={String(summary.kpis.assignmentsDue)} />
              <Kpi label="Certificats obtenus" value={String(summary.kpis.certificatesCount)} />
            </div>

            <div className="panels-row">
              <div className="panel">
                <h5>
                  Heures d&rsquo;étude hebdomadaires <span className="tag">Cette semaine</span>
                </h5>
                <BarChart data={STUDY_DATA} />
              </div>
              <div className="panel">
                <h5>Mes cours</h5>
                <div className="list-simple">
                  {summary.courses.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                      Vous n&rsquo;êtes inscrit à aucun cours pour le moment.
                    </p>
                  ) : (
                    summary.courses.map((c) => (
                      <a
                        key={c.id}
                        href={`/dashboard/student/courses/${c.id}`}
                        className="row"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <span>{c.title} — {c.teacher}</span>
                        <span className={`pill ${c.status === 'COMPLETED' ? 'ok' : 'warn'}`}>{c.progress}%</span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>

            {announcements.length > 0 && (
              <div className="panel" style={{ marginTop: 18, borderColor: 'var(--gold)' }}>
                <h5>📣 Annonces</h5>
                <div className="list-simple">
                  {announcements.map((a) => (
                    <div key={a.id} className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontWeight: 600 }}>{a.title}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{a.course.title}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>{a.body}</p>
                      <span style={{ fontSize: 10.5, color: 'var(--text-soft)' }}>
                        {new Date(a.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="panel" style={{ marginTop: 18 }}>
              <h5>Prochaines échéances</h5>
              <div className="list-simple">
                {summary.deadlines.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Aucune échéance à venir.</p>
                ) : (
                  summary.deadlines.map((d) => (
                    <div key={d.examId} className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{d.label}</span>
                        {d.done ? (
                          <span className="pill ok">{d.tag}</span>
                        ) : d.type === 'ASSIGNMENT' ? (
                          submittingId === d.examId ? null : (
                            <button
                              className="pill warn"
                              onClick={() => {
                                setSubmittingId(d.examId);
                                setSubmitError(null);
                              }}
                            >
                              Remettre
                            </button>
                          )
                        ) : (
                          <a href={`/dashboard/student/exams/${d.examId}`} className="pill warn" style={{ textDecoration: 'none' }}>
                            Passer l&rsquo;examen
                          </a>
                        )}
                      </div>
                      {submittingId === d.examId && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Votre réponse (optionnel si vous joignez un fichier)…"
                            style={{ flex: 1, minWidth: 160, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12.5 }}
                          />
                          <FileUploadButton label="📎 Joindre un fichier" onUploaded={setSubmissionFileUrl} />
                          <button className="btn btn-sm btn-primary" onClick={() => handleSubmitAssignment(d.examId)}>
                            Envoyer
                          </button>
                        </div>
                      )}
                      {submittingId === d.examId && submissionFileUrl && (
                        <span style={{ fontSize: 11, color: 'var(--success)' }}>Fichier prêt à être joint ✓</span>
                      )}
                      {submittingId === d.examId && submitError && (
                        <span style={{ color: 'var(--danger)', fontSize: 11.5 }}>{submitError}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
