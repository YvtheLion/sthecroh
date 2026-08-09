'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { teacherCoursesApi, TeacherCourseDto, ApiError } from '../../lib/api';

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function TeacherCoursesList() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<TeacherCourseDto[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState(4);
  const [priceCents, setPriceCents] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    teacherCoursesApi.list(token).then(setCourses).catch(() => setCourses([]));
  };

  useEffect(load, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await teacherCoursesApi.create(token, {
        title: title.trim(),
        slug: slugify(title) + '-' + Date.now().toString().slice(-4),
        description: description.trim() || undefined,
        credits,
        priceCents,
      });
      setTitle('');
      setDescription('');
      setCredits(4);
      setPriceCents(0);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Supprimer ce cours et tout son contenu ?')) return;
    await teacherCoursesApi.remove(token, id);
    load();
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Mes cours</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Annuler' : '+ Nouveau cours'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="tc-card">
          <div className="admin-form-grid">
            <div className="field full">
              <label>Titre du cours</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex. Éthique chrétienne" />
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brève description du cours" />
            </div>
            <div className="field">
              <label>Crédits</label>
              <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Prix (centimes, 0 = gratuit)</label>
              <input type="number" value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} />
            </div>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</p>}
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving} style={{ marginTop: 14 }}>
            {saving ? 'Création…' : 'Créer le cours (brouillon)'}
          </button>
        </form>
      )}

      {!courses ? (
        <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement…</p>
      ) : courses.length === 0 ? (
        <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Vous n&rsquo;avez pas encore créé de cours.</p>
      ) : (
        courses.map((c) => (
          <div key={c.id} className="tc-card">
            <div className="tc-card-head">
              <h4>{c.title}</h4>
              <span className={`pill ${c.status === 'PUBLISHED' ? 'ok' : 'warn'}`}>{c.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}</span>
            </div>
            <div className="tc-meta">
              {c._count.enrollments} étudiant{c._count.enrollments > 1 ? 's' : ''} · {c._count.modules} module{c._count.modules > 1 ? 's' : ''} ·{' '}
              {c._count.exams} examen{c._count.exams > 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <a href={`/dashboard/teacher/courses/${c.id}`} className="btn btn-sm btn-primary">
                Gérer le contenu
              </a>
              <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(c.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
