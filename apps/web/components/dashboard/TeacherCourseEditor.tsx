'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { teacherCoursesApi, announcementsApi, TeacherCourseDetailDto, ApiError } from '../../lib/api';
import { FileUploadButton } from './FileUploadButton';

type DraftQuestion = { type: 'MCQ' | 'TRUE_FALSE' | 'OPEN'; prompt: string; points: number; options: { id: string; label: string; correct: boolean }[] };

function emptyLessonForm() {
  return { title: '', type: 'VIDEO', videoUrl: '', pdfUrl: '', durationMin: '', liveStartsAt: '' };
}

function emptyQuestion(): DraftQuestion {
  return {
    type: 'MCQ',
    prompt: '',
    points: 10,
    options: [
      { id: 'a', label: '', correct: true },
      { id: 'b', label: '', correct: false },
    ],
  };
}

export function TeacherCourseEditor({ courseId }: { courseId: string }) {
  const { token } = useAuth();
  const [course, setCourse] = useState<TeacherCourseDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinedLiveId, setJoinedLiveId] = useState<string | null>(null);
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [announceSaving, setAnnounceSaving] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState<string | null>(null);

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; type: string; videoUrl: string; pdfUrl: string; durationMin: string; liveStartsAt: string }>>({});

  const [showExamForm, setShowExamForm] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<'QUIZ' | 'EXAM' | 'ASSIGNMENT'>('QUIZ');
  const [examDuration, setExamDuration] = useState(15);
  const [examInstructions, setExamInstructions] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [savingExam, setSavingExam] = useState(false);

  const load = () => {
    if (!token) return;
    teacherCoursesApi
      .detail(token, courseId)
      .then(setCourse)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger ce cours.'));
  };

  useEffect(load, [token, courseId]);

  const togglePublish = async () => {
    if (!token || !course) return;
    await teacherCoursesApi.update(token, courseId, { status: course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
    load();
  };

  const sendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !announceTitle.trim() || !announceBody.trim()) return;
    setAnnounceSaving(true);
    setAnnounceMessage(null);
    try {
      await announcementsApi.create(token, { courseId, title: announceTitle.trim(), body: announceBody.trim() });
      setAnnounceMessage('✓ Annonce envoyée à tous les étudiants inscrits.');
      setAnnounceTitle('');
      setAnnounceBody('');
      setShowAnnounceForm(false);
    } catch (err) {
      setAnnounceMessage(err instanceof ApiError ? err.message : "Envoi impossible.");
    } finally {
      setAnnounceSaving(false);
    }
  };

  const addModule = async () => {
    if (!token || !newModuleTitle.trim()) return;
    await teacherCoursesApi.addModule(token, courseId, newModuleTitle.trim());
    setNewModuleTitle('');
    load();
  };

  const deleteModule = async (moduleId: string) => {
    if (!token) return;
    if (!confirm('Supprimer ce module et ses leçons ?')) return;
    await teacherCoursesApi.deleteModule(token, moduleId);
    load();
  };

  const addLesson = async (moduleId: string) => {
    if (!token) return;
    const form = lessonForms[moduleId];
    if (!form?.title.trim()) return;
    await teacherCoursesApi.addLesson(token, moduleId, {
      title: form.title.trim(),
      type: form.type,
      videoUrl: form.videoUrl.trim() || undefined,
      pdfUrl: form.pdfUrl.trim() || undefined,
      durationMin: form.durationMin ? Number(form.durationMin) : undefined,
      liveStartsAt: form.type === 'LIVE_SESSION' && form.liveStartsAt ? new Date(form.liveStartsAt).toISOString() : undefined,
    });
    setLessonForms((f) => ({ ...f, [moduleId]: emptyLessonForm() }));
    load();
  };

  const deleteLesson = async (lessonId: string) => {
    if (!token) return;
    await teacherCoursesApi.deleteLesson(token, lessonId);
    load();
  };

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIndex: number, optIndex: number, label: string) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIndex ? { ...q, options: q.options.map((o, oi) => (oi === optIndex ? { ...o, label } : o)) } : q)),
    );
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIndex ? { ...q, options: q.options.map((o, oi) => ({ ...o, correct: oi === optIndex })) } : q)),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, { id: String.fromCharCode(97 + q.options.length), label: '', correct: false }] } : q,
      ),
    );
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !examTitle.trim()) return;
    setSavingExam(true);
    setError(null);
    try {
      await teacherCoursesApi.createExam(token, courseId, {
        title: examTitle.trim(),
        type: examType,
        durationMin: examType === 'ASSIGNMENT' ? undefined : examDuration,
        instructions: examInstructions.trim() || undefined,
        questions:
          examType === 'ASSIGNMENT'
            ? undefined
            : questions
                .filter((q) => q.prompt.trim())
                .map((q) => ({
                  type: q.type,
                  prompt: q.prompt.trim(),
                  points: q.points,
                  options: q.type === 'OPEN' ? undefined : q.options.filter((o) => o.label.trim()),
                })),
      });
      setShowExamForm(false);
      setExamTitle('');
      setExamInstructions('');
      setQuestions([emptyQuestion()]);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Création impossible.');
    } finally {
      setSavingExam(false);
    }
  };

  const deleteExam = async (examId: string) => {
    if (!token) return;
    if (!confirm('Supprimer cet examen ?')) return;
    await teacherCoursesApi.deleteExam(token, examId);
    load();
  };

  if (error && !course) return <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>;
  if (!course) return <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement…</p>;

  return (
    <div>
      <div className="course-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>
        <button className="btn btn-sm btn-primary" onClick={togglePublish}>
          {course.status === 'PUBLISHED' ? 'Dépublier' : 'Publier le cours'}
        </button>
      </div>

      {!showAnnounceForm ? (
        <button className="btn btn-sm btn-gold" onClick={() => setShowAnnounceForm(true)} style={{ marginBottom: 20 }}>
          📣 Envoyer une annonce aux étudiants
        </button>
      ) : (
        <form onSubmit={sendAnnouncement} className="tc-card" style={{ marginBottom: 20 }}>
          <div className="field">
            <label>Titre de l&rsquo;annonce</label>
            <input value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} required placeholder="Ex. Report du cours de mercredi" />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea rows={3} value={announceBody} onChange={(e) => setAnnounceBody(e.target.value)} required />
          </div>
          {announceMessage && (
            <p style={{ fontSize: 13, marginBottom: 10, color: announceMessage.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>
              {announceMessage}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={announceSaving}>
              {announceSaving ? 'Envoi…' : 'Envoyer à tous les étudiants inscrits'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAnnounceForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 18, margin: '24px 0 14px' }}>
        Modules &amp; leçons
      </h3>
      {course.modules.map((m) => (
        <div key={m.id} className="tc-card">
          <div className="tc-card-head">
            <h4>{m.title}</h4>
            <button className="admin-icon-btn danger" onClick={() => deleteModule(m.id)}>🗑</button>
          </div>
          {m.lessons.map((l) => {
            const isPastLive = l.type === 'LIVE_SESSION' && l.liveStartsAt && new Date(l.liveStartsAt).getTime() < Date.now();
            return (
            <div key={l.id}>
              <div className="tc-lesson-row">
                <span>{l.type === 'VIDEO' ? '🎬' : l.type === 'PDF' ? '📄' : l.type === 'LIVE_SESSION' ? '🔴' : '📝'}</span>
                <span style={{ flex: 1 }}>{l.title}</span>
                <span className="tc-meta">
                  {l.type === 'LIVE_SESSION' && l.liveStartsAt
                    ? new Date(l.liveStartsAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : l.durationMin
                      ? `${l.durationMin} min`
                      : ''}
                  {isPastLive && (l.videoUrl ? ' · 🎬 enregistrement en ligne' : ' · terminée, pas encore d’enregistrement')}
                </span>
                {l.type === 'LIVE_SESSION' && l.liveUrl && !isPastLive && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setJoinedLiveId(joinedLiveId === l.id ? null : l.id)}
                  >
                    {joinedLiveId === l.id ? 'Fermer' : '🔴 Rejoindre'}
                  </button>
                )}
                {isPastLive && (
                  <FileUploadButton
                    label={l.videoUrl ? '📎 Remplacer l’enregistrement' : '📎 Déposer l’enregistrement'}
                    accept="video/*"
                    onUploaded={async (url) => {
                      if (!token) return;
                      await teacherCoursesApi.updateLesson(token, l.id, { videoUrl: url });
                      load();
                    }}
                  />
                )}
                <button className="admin-icon-btn danger" onClick={() => deleteLesson(l.id)}>🗑</button>
              </div>
              {joinedLiveId === l.id && l.liveUrl && !isPastLive && (
                <div style={{ borderTop: '1px solid var(--border)', aspectRatio: '16/9', background: '#111633' }}>
                  <iframe
                    src={`${l.liveUrl}#config.prejoinPageEnabled=false`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    style={{ width: '100%', height: '100%', border: 0 }}
                    title={`Session en direct — ${l.title}`}
                  />
                </div>
              )}
            </div>
            );
          })}
          <div className="tc-inline-form">
            <input
              placeholder="Titre de la leçon"
              value={lessonForms[m.id]?.title ?? ''}
              onChange={(e) => setLessonForms((f) => ({ ...f, [m.id]: { ...(f[m.id] ?? emptyLessonForm()), title: e.target.value } }))}
              style={{ flex: 1, minWidth: 140 }}
            />
            <select
              value={lessonForms[m.id]?.type ?? 'VIDEO'}
              onChange={(e) => setLessonForms((f) => ({ ...f, [m.id]: { ...(f[m.id] ?? emptyLessonForm()), type: e.target.value } }))}
            >
              <option value="VIDEO">Vidéo</option>
              <option value="PDF">PDF</option>
              <option value="ARTICLE">Article</option>
              <option value="LIVE_SESSION">🔴 Session en direct (visio)</option>
            </select>

            {lessonForms[m.id]?.type === 'LIVE_SESSION' ? (
              <input
                type="datetime-local"
                value={lessonForms[m.id]?.liveStartsAt ?? ''}
                onChange={(e) => setLessonForms((f) => ({ ...f, [m.id]: { ...(f[m.id] ?? emptyLessonForm()), liveStartsAt: e.target.value } }))}
              />
            ) : (
              <>
                <input
                  placeholder="URL vidéo/PDF (ou téléversez un fichier →)"
                  value={lessonForms[m.id]?.videoUrl ?? ''}
                  onChange={(e) => setLessonForms((f) => ({ ...f, [m.id]: { ...(f[m.id] ?? emptyLessonForm()), videoUrl: e.target.value } }))}
                  style={{ flex: 1, minWidth: 140 }}
                />
                <FileUploadButton
                  label="📎 Téléverser"
                  accept="video/*,application/pdf,image/*"
                  onUploaded={(url) => setLessonForms((f) => ({ ...f, [m.id]: { ...(f[m.id] ?? emptyLessonForm()), videoUrl: url } }))}
                />
                <input
                  type="number"
                  placeholder="Durée (min)"
                  value={lessonForms[m.id]?.durationMin ?? ''}
                  onChange={(e) => setLessonForms((f) => ({ ...f, [m.id]: { ...(f[m.id] ?? emptyLessonForm()), durationMin: e.target.value } }))}
                  style={{ width: 90 }}
                />
              </>
            )}
            <button className="btn btn-sm btn-primary" onClick={() => addLesson(m.id)}>+ Leçon</button>
          </div>
        </div>
      ))}
      <div className="tc-inline-form">
        <input placeholder="Nom du nouveau module" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} style={{ flex: 1 }} />
        <button className="btn btn-sm btn-primary" onClick={addModule}>+ Module</button>
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 18, margin: '28px 0 14px' }}>
        Examens &amp; devoirs
      </h3>
      {course.exams.map((ex) => (
        <div key={ex.id} className="tc-card">
          <div className="tc-card-head">
            <h4>{ex.title}</h4>
            <button className="admin-icon-btn danger" onClick={() => deleteExam(ex.id)}>🗑</button>
          </div>
          <div className="tc-meta">
            {ex.type} · {ex.questions.length} question{ex.questions.length > 1 ? 's' : ''} · {ex.maxScore} pts
          </div>
        </div>
      ))}

      {!showExamForm ? (
        <button className="btn btn-sm btn-primary" onClick={() => setShowExamForm(true)}>+ Nouvel examen / devoir</button>
      ) : (
        <form onSubmit={handleCreateExam} className="tc-card">
          <div className="admin-form-grid">
            <div className="field">
              <label>Titre</label>
              <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} required placeholder="Ex. Quiz — Chapitre 2" />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value as any)}>
                <option value="QUIZ">Quiz</option>
                <option value="EXAM">Examen</option>
                <option value="ASSIGNMENT">Devoir (texte libre)</option>
              </select>
            </div>
            {examType !== 'ASSIGNMENT' && (
              <div className="field">
                <label>Durée (minutes)</label>
                <input type="number" value={examDuration} onChange={(e) => setExamDuration(Number(e.target.value))} />
              </div>
            )}
            <div className="field full">
              <label>Instructions</label>
              <textarea rows={2} value={examInstructions} onChange={(e) => setExamInstructions(e.target.value)} />
            </div>
          </div>

          {examType !== 'ASSIGNMENT' && (
            <div style={{ marginTop: 16 }}>
              {questions.map((q, qi) => (
                <div key={qi} className="tc-question-row">
                  <div className="tc-inline-form" style={{ marginTop: 0 }}>
                    <select value={q.type} onChange={(e) => updateQuestion(qi, { type: e.target.value as any })}>
                      <option value="MCQ">QCM</option>
                      <option value="TRUE_FALSE">Vrai/Faux</option>
                      <option value="OPEN">Question ouverte</option>
                    </select>
                    <input
                      placeholder="Énoncé de la question"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                      style={{ flex: 1, minWidth: 200 }}
                    />
                    <input
                      type="number"
                      value={q.points}
                      onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) })}
                      style={{ width: 70 }}
                      title="Points"
                    />
                  </div>
                  {q.type !== 'OPEN' && (
                    <div style={{ marginTop: 8, paddingLeft: 8 }}>
                      {q.options.map((o, oi) => (
                        <div key={o.id} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                          <input type="radio" checked={o.correct} onChange={() => setCorrectOption(qi, oi)} />
                          <input
                            placeholder={`Option ${o.id.toUpperCase()}`}
                            value={o.label}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12.5 }}
                          />
                        </div>
                      ))}
                      {q.type === 'MCQ' && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => addOption(qi)}>
                          + Option
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}>
                + Ajouter une question
              </button>
            </div>
          )}

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={savingExam}>
              {savingExam ? 'Création…' : 'Créer'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowExamForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
