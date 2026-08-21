'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { learningApi, liveSessionApi, CourseLearnDto, LessonDto, ApiError } from '../../lib/api';

export function CourseLearning({ courseId }: { courseId: string }) {
  const { token } = useAuth();
  const [course, setCourse] = useState<CourseLearnDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [joinedLiveId, setJoinedLiveId] = useState<string | null>(null);
  const [liveJoinUrl, setLiveJoinUrl] = useState<string | null>(null);
  const [joiningLive, setJoiningLive] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    learningApi
      .getCourse(token, courseId)
      .then((c) => {
        setCourse(c);
        if (!activeLessonId) {
          const firstLesson = c.modules.flatMap((m) => m.lessons)[0];
          if (firstLesson) setActiveLessonId(firstLesson.id);
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger ce cours.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseId]);

  if (loading) {
    return <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement du cours…</p>;
  }
  if (error || !course) {
    return <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error ?? 'Cours introuvable.'}</p>;
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const activeLesson: LessonDto | undefined = allLessons.find((l) => l.id === activeLessonId) ?? allLessons[0];
  const isPastLive =
    activeLesson?.type === 'LIVE_SESSION' && activeLesson.liveStartsAt && new Date(activeLesson.liveStartsAt).getTime() < Date.now();

  const markComplete = async (lessonId: string) => {
    if (!token) return;
    setMarking(true);
    try {
      await learningApi.completeLesson(token, lessonId);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Impossible de valider cette leçon.');
    } finally {
      setMarking(false);
    }
  };

  const joinLive = async (lessonId: string) => {
    if (!token) return;
    setJoiningLive(true);
    try {
      const { joinUrl } = await liveSessionApi.getJoinUrl(token, lessonId);
      setLiveJoinUrl(joinUrl);
      setJoinedLiveId(lessonId);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Impossible de rejoindre cette session.');
    } finally {
      setJoiningLive(false);
    }
  };

  return (
    <div>
      <div className="course-header">
        <h1>{course.title}</h1>
        <p>
          {course.teacher} · Progression : <b>{course.progress}%</b>
        </p>
        <div className="progress-track" style={{ maxWidth: 320, marginTop: 10 }}>
          <div className="progress-fill" style={{ width: `${course.progress}%` }} />
        </div>
      </div>

      <div className="learn-grid">
        <div className="lesson-viewer">
          <div className="screen" style={joinedLiveId === activeLesson?.id ? { padding: 0 } : undefined}>
            {activeLesson?.type === 'LIVE_SESSION' && isPastLive && activeLesson.videoUrl ? (
              <button
                aria-label="Lire l'enregistrement"
                style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.15)',
                  border: '1.5px solid rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 24 24" width={22} height={22} style={{ fill: '#fff', marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : activeLesson?.type === 'LIVE_SESSION' && isPastLive ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎬</div>
                <p style={{ opacity: 0.85, fontSize: 13 }}>
                  Session terminée — l&rsquo;enregistrement n&rsquo;est pas encore disponible
                </p>
              </div>
            ) : activeLesson?.type === 'LIVE_SESSION' && joinedLiveId === activeLesson.id && liveJoinUrl ? (
              <iframe
                src={liveJoinUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                style={{ width: '100%', height: '100%', border: 0 }}
                title="Session en direct STHECROH"
              />
            ) : activeLesson?.type === 'LIVE_SESSION' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔴</div>
                <p style={{ opacity: 0.85, fontSize: 13 }}>
                  {activeLesson.liveStartsAt
                    ? `Prévu le ${new Date(activeLesson.liveStartsAt).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`
                    : 'Session en direct'}
                </p>
              </div>
            ) : activeLesson?.type === 'PDF' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                <p style={{ opacity: 0.8, fontSize: 13 }}>Document PDF</p>
              </div>
            ) : (
              <button
                aria-label="Lire la vidéo"
                style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.15)',
                  border: '1.5px solid rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 24 24" width={22} height={22} style={{ fill: '#fff', marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>
          <div className="body">
            <h3>{activeLesson?.title ?? 'Sélectionnez une leçon'}</h3>
            {activeLesson?.content && <p>{activeLesson.content}</p>}
            {activeLesson?.durationMin && <p>Durée estimée : {activeLesson.durationMin} min</p>}
            {activeLesson?.type === 'LIVE_SESSION' && !isPastLive && activeLesson.liveUrl && (
              joinedLiveId === activeLesson.id ? (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-block', marginBottom: 12 }}
                  onClick={() => { setJoinedLiveId(null); setLiveJoinUrl(null); }}
                >
                  Quitter la session
                </button>
              ) : (
                <button
                  className="btn btn-gold btn-sm"
                  disabled={joiningLive}
                  style={{ display: 'inline-block', marginBottom: 12 }}
                  onClick={() => joinLive(activeLesson.id)}
                >
                  {joiningLive ? 'Connexion…' : '🔴 Rejoindre le cours en direct'}
                </button>
              )
            )}
            {activeLesson && (
              <button
                className="btn btn-primary btn-sm"
                disabled={activeLesson.completed || marking}
                onClick={() => markComplete(activeLesson.id)}
              >
                {activeLesson.completed ? 'Terminée ✓' : marking ? 'Enregistrement…' : 'Marquer comme terminée'}
              </button>
            )}
          </div>
        </div>

        <div className="module-list">
          {course.modules.map((m) => (
            <div key={m.id} className="module-block">
              <div className="module-title">{m.title}</div>
              {m.lessons.map((l) => (
                <div
                  key={l.id}
                  className={`lesson-item${l.completed ? ' done' : ''}${activeLessonId === l.id ? ' active' : ''}`}
                  onClick={() => setActiveLessonId(l.id)}
                >
                  <span className="check">{l.completed ? '✓' : ''}</span>
                  <span>{l.title}</span>
                  <span className="meta">
                    {l.type === 'LIVE_SESSION'
                      ? l.liveStartsAt && new Date(l.liveStartsAt).getTime() < Date.now()
                        ? l.videoUrl
                          ? '🎬 Enregistrement'
                          : 'Terminée'
                        : '🔴 Direct'
                      : l.type === 'PDF'
                        ? 'PDF'
                        : l.durationMin
                          ? `${l.durationMin} min`
                          : ''}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
