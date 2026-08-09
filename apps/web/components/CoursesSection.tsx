'use client';

import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { useAuth } from '../lib/auth-context';
import { useUI } from '../lib/ui-context';
import { coursesApi, enrollmentsApi, PublicCourse, ApiError } from '../lib/api';

// Cours de secours affichés tant que l'API n'a pas encore répondu ou si elle est vide
const FALLBACK = [
  { code: 'TS', title: 'Théologie systématique I', prof: 'Dr. Samuel Diarra · 24 leçons', w: 78, label: '78% complété', action: 'Continuer' },
  { code: 'HB', title: 'Herméneutique biblique', prof: 'Dr. Ruth Kaboré · 18 leçons', w: 52, label: '52% complété', action: 'Continuer' },
  { code: 'HE', title: "Histoire de l'Église", prof: 'Pr. Jean-Baptiste Nko · 20 leçons', w: 100, label: 'Terminé', action: 'Revoir' },
  { code: 'GB', title: 'Grec biblique', prof: 'Dr. Élise Fanon · 30 leçons', w: 34, label: '34% complété', action: 'Continuer' },
];

function initials(title: string) {
  return title
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || title.slice(0, 2).toUpperCase();
}

function ProgressFill({ w }: { w: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.width = w + '%';
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [w]);
  return <div className="progress-fill" ref={ref} style={{ width: 0 }} />;
}

function RealCourseCard({ course }: { course: PublicCourse }) {
  const { user, token } = useAuth();
  const { openModal, showToast } = useUI();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!user || !token) {
      openModal('login');
      return;
    }
    setEnrolling(true);
    setError(null);
    try {
      await enrollmentsApi.enroll(token, course.id);
      setEnrolled(true);
      showToast(`Inscription confirmée à « ${course.title} »`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Impossible de vous inscrire pour le moment.";
      setError(message);
      showToast(message);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="course-card">
      <div className="course-thumb">{initials(course.title)}</div>
      <div className="course-info">
        <h4>{course.title}</h4>
        <div className="prof">
          {course.teacher.firstName} {course.teacher.lastName}
          {course.priceCents > 0 ? ` · ${(course.priceCents / 100).toFixed(2)} $` : ' · Gratuit'}
        </div>
        <div className="progress-track">
          <ProgressFill w={enrolled ? 100 : 0} />
        </div>
        <div className="course-foot">
          <span>{enrolled ? 'Inscrit' : `${course.credits} crédits`}</span>
          <button className="btn btn-sm btn-ghost" onClick={handleEnroll} disabled={enrolling || enrolled}>
            {enrolled ? 'Inscrit ✓' : enrolling ? 'Inscription…' : "S'inscrire"}
          </button>
        </div>
        {error && (
          <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8, fontWeight: 600 }}>
            ⚠ {error}
          </div>
        )}
      </div>
    </div>
  );
}

export function CoursesSection() {
  const head = useReveal();
  const grid = useReveal();
  const playerReveal = useReveal();
  const [playing, setPlaying] = useState(false);
  const fillRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [courses, setCourses] = useState<PublicCourse[] | null>(null);

  useEffect(() => {
    coursesApi
      .list()
      .then((list) => setCourses(list))
      .catch(() => setCourses([]));
  }, []);

  const togglePlay = () => {
    setPlaying((p) => {
      const next = !p;
      const fill = fillRef.current;
      if (next) {
        intervalRef.current = setInterval(() => {
          if (!fill) return;
          let w = parseFloat(fill.style.width) || 34;
          w = w >= 100 ? 34 : w + 1;
          fill.style.width = w + '%';
        }, 400);
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return next;
    });
  };

  const showRealCourses = courses && courses.length > 0;

  return (
    <section id="cours">
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Module cours</div>
          <h2 className="section-title">Apprendre à votre rythme, avec exigence.</h2>
          <p className="section-lede">
            Vidéos, supports PDF, quiz et suivi de progression : chaque cours est structuré pour un
            apprentissage progressif et mesurable.
            {courses !== null && !showRealCourses && (
              <> (aucun cours en base pour l&rsquo;instant — aperçu de démonstration ci-dessous)</>
            )}
          </p>
        </div>

        <div ref={grid.ref} className={`course-grid ${grid.className}`}>
          {showRealCourses
            ? courses!.map((c) => <RealCourseCard key={c.id} course={c} />)
            : FALLBACK.map((c) => (
                <div key={c.code} className="course-card">
                  <div className="course-thumb">{c.code}</div>
                  <div className="course-info">
                    <h4>{c.title}</h4>
                    <div className="prof">{c.prof}</div>
                    <div className="progress-track">
                      <ProgressFill w={c.w} />
                    </div>
                    <div className="course-foot">
                      <span>{c.label}</span>
                      <button className="btn btn-sm btn-ghost">{c.action}</button>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        <div ref={playerReveal.ref} className={`player ${playerReveal.className}`}>
          <div className="player-screen">
            <button className="play-btn" aria-label="Lire la vidéo" onClick={togglePlay}>
              {playing ? (
                <svg viewBox="0 0 24 24" style={{ fill: '#fff' }}>
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" style={{ fill: '#fff' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="player-caption">Leçon 4 — L&rsquo;exégèse du Nouveau Testament · 18:24</div>
            <div className="player-progress">
              <i ref={fillRef} style={{ width: '34%' }} />
            </div>
          </div>
          <div className="player-side">
            <h4>Herméneutique biblique</h4>
            <p>
              Leçon 4 sur 18 — Comprendre les méthodes d&rsquo;exégèse contextuelle et grammaticale du
              Nouveau Testament.
            </p>
            <button className="pdf-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Z" />
              </svg>
              Support de cours.pdf
              <span style={{ marginLeft: 'auto', fontWeight: 500, color: 'var(--text-soft)' }}>2.4 Mo</span>
            </button>
            <button className="pdf-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Z" />
              </svg>
              Plan du cours.pdf
              <span style={{ marginLeft: 'auto', fontWeight: 500, color: 'var(--text-soft)' }}>640 Ko</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
