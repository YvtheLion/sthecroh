'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, DepartmentDto, ProgramDto } from '../lib/api';

const FALLBACK_PROGRAMS = [
  { id: 'f1', name: 'Certificat en Théologie Biblique', durationYears: 1, degreeLevel: 'Certificat' },
  { id: 'f2', name: 'Licence en Théologie Systématique', durationYears: 4, degreeLevel: 'Licence' },
  { id: 'f3', name: 'Licence en Ministère Pastoral', durationYears: 4, degreeLevel: 'Licence' },
  { id: 'f4', name: 'Master en Herméneutique Biblique', durationYears: 2, degreeLevel: 'Master' },
];
const FALLBACK_DEPARTMENTS = [
  { id: 'd1', name: 'Théologie Systématique', description: 'Doctrine, dogmatique et éthique chrétienne.' },
  { id: 'd2', name: 'Langues Bibliques', description: 'Grec koinè, hébreu biblique et exégèse originale.' },
  { id: 'd3', name: 'Ministère Pastoral', description: 'Homilétique, counseling et direction d’église.' },
  { id: 'd4', name: "Histoire de l'Église", description: 'Patristique, Réforme et christianisme contemporain.' },
];

export function ProgramsDepartments() {
  const head = useReveal();
  const programsReveal = useReveal();
  const deptsReveal = useReveal();

  const [programs, setPrograms] = useState<ProgramDto[] | typeof FALLBACK_PROGRAMS>(FALLBACK_PROGRAMS);
  const [departments, setDepartments] = useState<DepartmentDto[] | typeof FALLBACK_DEPARTMENTS>(FALLBACK_DEPARTMENTS);

  useEffect(() => {
    contentApi.programs().then((list) => list.length && setPrograms(list)).catch(() => {});
    contentApi.departments().then((list) => list.length && setDepartments(list)).catch(() => {});
  }, []);

  return (
    <section id="formations">
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Formations &amp; départements</div>
          <h2 className="section-title">Des parcours structurés, du certificat au master.</h2>
          <p className="section-lede">
            Chaque programme est rattaché à un département académique dirigé par un corps professoral
            qualifié.
          </p>
        </div>

        <div ref={programsReveal.ref} className={`program-grid ${programsReveal.className}`}>
          {programs.map((p) => (
            <div key={p.id} className="program-row">
              <div>
                <h4>{p.name}</h4>
                <span className="meta">{p.durationYears} an{p.durationYears > 1 ? 's' : ''} · {p.degreeLevel}</span>
              </div>
              <span className="arrow">→</span>
            </div>
          ))}
        </div>

        <div ref={deptsReveal.ref} className={deptsReveal.className}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 20, marginBottom: 24 }}>
            Nos départements
          </h4>
          <div className="dept-grid">
            {departments.map((d) => (
              <div key={d.id} className="dept-card">
                <h4>{d.name}</h4>
                <p>{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
