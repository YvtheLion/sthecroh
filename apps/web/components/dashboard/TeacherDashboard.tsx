'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { dashboardApi, submissionsApi, TeacherDashboardSummary, ApiError } from '../../lib/api';

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

const RESULTS_DATA = [
  { label: 'Ex1', h: 88 },
  { label: 'Ex2', h: 74 },
  { label: 'Ex3', h: 91 },
  { label: 'Ex4', h: 66 },
  { label: 'Ex5', h: 83 },
  { label: 'Ex6', h: 95 },
];

const NAV_ITEMS = [
  { key: 'overview', label: 'Tableau de bord', icon: '⌂', href: '/dashboard/teacher' },
  { key: 'classes', label: 'Mes cours', icon: '▤', href: '/dashboard/teacher/courses' },
  { key: 'grading', label: 'Devoirs à corriger', icon: '✎', href: '/dashboard/teacher' },
  { key: 'messages', label: 'Messagerie', icon: '✉', href: '/dashboard/teacher/messages' },
  { key: 'library', label: 'Bibliothèque', icon: '📖', href: '/dashboard/student/library' },
  { key: 'stats', label: 'Statistiques', icon: '◔', href: '/dashboard/teacher' },
  { key: 'settings', label: 'Paramètres', icon: '⚙', href: '/dashboard/teacher' },
];

export function TeacherDashboard({ firstName }: { firstName: string }) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<TeacherDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [joinedLiveId, setJoinedLiveId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    dashboardApi
      .teacherSummary(token)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submitGrade = async (submissionId: string) => {
    if (!token) return;
    const score = Number(scoreInput);
    if (Number.isNaN(score)) return;
    try {
      await submissionsApi.grade(token, submissionId, score);
      setGradingId(null);
      setScoreInput('');
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Impossible de noter cette copie.');
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
        <div className="dash-welcome">Bienvenue, {firstName} 👋</div>
        <div className="dash-sub">Voici un résumé réel de vos classes.</div>

        {loading || !summary ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement de vos données…</p>
        ) : (
          <>
            <div className="kpi-row">
              <Kpi label="Cours actifs" value={String(summary.kpis.activeCourses)} />
              <Kpi label="Étudiants" value={String(summary.kpis.studentsCount)} />
              <Kpi label="Copies à corriger" value={String(summary.kpis.pendingGrading)} />
              <Kpi label="Taux de réussite" value={`${summary.kpis.successRate}%`} />
            </div>

            {summary.liveSessions.length > 0 && (
              <div className="panel" style={{ marginBottom: 18, borderColor: 'var(--gold)' }}>
                <h5>🔴 Sessions en direct</h5>
                <div className="list-simple">
                  {summary.liveSessions.map((l) => (
                    <div key={l.id}>
                      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                        <span>
                          {l.courseTitle} — {l.title}
                          {l.liveStartsAt && (
                            <span style={{ color: 'var(--text-soft)', marginLeft: 8, fontSize: 12 }}>
                              {new Date(l.liveStartsAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                        {l.liveUrl && (
                          <button className="btn btn-sm btn-gold" onClick={() => setJoinedLiveId(joinedLiveId === l.id ? null : l.id)}>
                            {joinedLiveId === l.id ? 'Fermer' : '🔴 Rejoindre'}
                          </button>
                        )}
                      </div>
                      {joinedLiveId === l.id && l.liveUrl && (
                        <div style={{ aspectRatio: '16/9', background: '#111633', borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
                          <iframe
                            src={`${l.liveUrl}#config.prejoinPageEnabled=false`}
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            style={{ width: '100%', height: '100%', border: 0 }}
                            title={`Session en direct — ${l.title}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="panels-row">
              <div className="panel">
                <h5>
                  Résultats moyens par classe <span className="tag">Semestre en cours</span>
                </h5>
                <BarChart data={RESULTS_DATA} />
              </div>
              <div className="panel">
                <h5>Mes cours</h5>
                <div className="list-simple">
                  {summary.courses.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Vous n&rsquo;avez pas encore de cours.</p>
                  ) : (
                    summary.courses.map((c) => (
                      <div key={c.id} className="row">
                        <span>{c.title} — {c.studentsCount} étudiant{c.studentsCount > 1 ? 's' : ''}</span>
                        <span className="pill ok">{c.examsCount} examen{c.examsCount > 1 ? 's' : ''}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 18 }}>
              <h5>Copies à corriger</h5>
              <div className="list-simple">
                {summary.pendingSubmissions.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Aucune copie en attente. 🎉</p>
                ) : (
                  summary.pendingSubmissions.map((s) => (
                    <div key={s.id} className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                      <span>{s.examTitle} — {s.studentName}</span>
                      {gradingId === s.id ? (
                        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scoreInput}
                            onChange={(e) => setScoreInput(e.target.value)}
                            placeholder="/100"
                            style={{ width: 56, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                          />
                          <button className="btn btn-sm btn-primary" onClick={() => submitGrade(s.id)}>
                            OK
                          </button>
                        </span>
                      ) : (
                        <button className="pill warn" onClick={() => setGradingId(s.id)}>
                          Noter
                        </button>
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
