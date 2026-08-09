'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { gradesApi, GradeDto, ApiError } from '../../lib/api';

function scoreClass(score: number, maxScore: number) {
  const pct = (score / maxScore) * 100;
  if (pct >= 70) return 'high';
  if (pct >= 50) return 'mid';
  return 'low';
}

export function GradesView() {
  const { token } = useAuth();
  const [grades, setGrades] = useState<GradeDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    gradesApi
      .mine(token)
      .then(setGrades)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les notes.'));
  }, [token]);

  if (error) return <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>;
  if (!grades) return <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement…</p>;

  const average =
    grades.length === 0
      ? null
      : Math.round((grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length) * 10) / 10;
  const best = grades.length === 0 ? null : Math.max(...grades.map((g) => (g.score / g.maxScore) * 100));

  return (
    <div>
      <div className="course-header">
        <h1>Mes notes &amp; résultats</h1>
        <p>L&rsquo;ensemble de vos évaluations notées, tous cours confondus.</p>
      </div>

      <div className="grades-summary">
        <div className="grade-card">
          <div className="num">{grades.length}</div>
          <div className="lbl">Évaluations notées</div>
        </div>
        <div className="grade-card">
          <div className="num">{average !== null ? `${average}%` : '—'}</div>
          <div className="lbl">Moyenne générale</div>
        </div>
        <div className="grade-card">
          <div className="num">{best !== null ? `${Math.round(best)}%` : '—'}</div>
          <div className="lbl">Meilleur résultat</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        {grades.length === 0 ? (
          <div className="admin-empty">Aucune note publiée pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cours</th>
                <th>Évaluation</th>
                <th>Type</th>
                <th>Note</th>
                <th>Commentaire</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td>{g.exam.course.title}</td>
                  <td>{g.exam.title}</td>
                  <td>{g.exam.type}</td>
                  <td>
                    <span className={`grade-score ${scoreClass(g.score, g.maxScore)}`}>
                      {g.score}/{g.maxScore}
                    </span>
                  </td>
                  <td style={{ maxWidth: 240 }}>{g.comment || '—'}</td>
                  <td>{new Date(g.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
