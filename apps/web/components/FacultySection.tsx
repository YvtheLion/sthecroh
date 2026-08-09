'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, Teacher } from '../lib/api';

const FALLBACK: Teacher[] = [
  { id: 'f1', firstName: 'Samuel', lastName: 'Diarra', title: 'Directeur académique — Théologie Systématique', avatarUrl: null },
  { id: 'f2', firstName: 'Ruth', lastName: 'Kaboré', title: 'Professeure — Herméneutique Biblique', avatarUrl: null },
  { id: 'f3', firstName: 'Jean-Baptiste', lastName: 'Nko', title: "Professeur — Histoire de l'Église", avatarUrl: null },
  { id: 'f4', firstName: 'Élise', lastName: 'Fanon', title: 'Professeure — Langues Bibliques', avatarUrl: null },
];

export function FacultySection() {
  const head = useReveal();
  const grid = useReveal();
  const [faculty, setFaculty] = useState<Teacher[]>(FALLBACK);

  useEffect(() => {
    contentApi.teachers().then((list) => list.length && setFaculty(list)).catch(() => {});
  }, []);

  return (
    <section id="enseignants" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div ref={head.ref} className={`section-head center ${head.className}`}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Corps professoral</div>
          <h2 className="section-title">Des enseignants reconnus, engagés auprès de chaque étudiant.</h2>
        </div>
        <div ref={grid.ref} className={`faculty-grid ${grid.className}`}>
          {faculty.map((f) => (
            <div key={f.id} className="faculty-card">
              <div className="faculty-avatar">
                {f.firstName[0]}
                {f.lastName[0]}
              </div>
              <h4>{f.firstName} {f.lastName}</h4>
              <p>{f.title ?? 'Enseignant'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
