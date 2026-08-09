'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { examTakingApi, ExamForStudentDto, ExamResultDto, ApiError } from '../../lib/api';

export function ExamTaking({ examId }: { examId: string }) {
  const { token } = useAuth();
  const [exam, setExam] = useState<ExamForStudentDto | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResultDto | null>(null);

  useEffect(() => {
    if (!token) return;
    examTakingApi
      .get(token, examId)
      .then(setExam)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger cet examen.'))
      .finally(() => setLoading(false));
  }, [token, examId]);

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await examTakingApi.submit(token, examId, answers);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Envoi impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement…</p>;
  if (error && !exam) return <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>;
  if (!exam) return null;

  if (result || exam.alreadyAttempted) {
    const score = result?.score ?? exam.previousScore;
    return (
      <div className="exam-result">
        <div className="course-header" style={{ textAlign: 'left' }}>
          <h1>{exam.title}</h1>
          <p>{exam.courseTitle}</p>
        </div>
        {result?.pendingManualGrading ? (
          <p style={{ color: 'var(--text-soft)', marginTop: 20 }}>
            Votre copie a été enregistrée. Certaines questions ouvertes nécessitent une correction manuelle
            par votre enseignant — votre note définitive apparaîtra bientôt dans "Mes notes".
          </p>
        ) : score !== null ? (
          <>
            <div className="score">{score}/{exam.maxScore}</div>
            <p style={{ color: 'var(--text-soft)', marginTop: 10 }}>
              {exam.alreadyAttempted && !result ? 'Vous avez déjà passé cet examen.' : 'Résultat enregistré avec succès.'}
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--text-soft)' }}>Vous avez déjà passé cet examen.</p>
        )}
        <a href="/dashboard/student/grades" className="btn btn-primary btn-sm" style={{ marginTop: 20, display: 'inline-block' }}>
          Voir mes notes
        </a>
      </div>
    );
  }

  const allAnswered = exam.questions.every((q) => answers[q.id]?.trim());

  return (
    <div>
      <div className="course-header">
        <h1>{exam.title}</h1>
        <p>
          {exam.courseTitle} · {exam.questions.length} question{exam.questions.length > 1 ? 's' : ''}
          {exam.durationMin ? ` · ${exam.durationMin} min` : ''}
        </p>
        {exam.instructions && <p style={{ marginTop: 8 }}>{exam.instructions}</p>}
      </div>

      {exam.questions.map((q, i) => (
        <div key={q.id} className="exam-question">
          <div className="prompt">
            {i + 1}. {q.prompt} <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>({q.points} pt{q.points > 1 ? 's' : ''})</span>
          </div>

          {q.type === 'OPEN' ? (
            <textarea
              rows={4}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Votre réponse…"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13.5 }}
            />
          ) : (
            (q.options ?? []).map((opt) => (
              <label key={opt.id} className={`exam-option${answers[q.id] === opt.id ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      ))}

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>}

      <button className="btn btn-primary btn-block" disabled={!allAnswered || submitting} onClick={handleSubmit}>
        {submitting ? 'Envoi…' : 'Soumettre mes réponses'}
      </button>
      {!allAnswered && (
        <p style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 8, textAlign: 'center' }}>
          Répondez à toutes les questions avant de soumettre.
        </p>
      )}
    </div>
  );
}
