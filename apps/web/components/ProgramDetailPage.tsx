'use client';

import { useEffect, useState } from 'react';
import { PublicPageShell } from './PublicPageShell';
import { detailApi, ProgramDetailDto } from '../lib/api';

export function ProgramDetailPage({ id }: { id: string }) {
  const [program, setProgram] = useState<ProgramDetailDto | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    detailApi.program(id).then(setProgram).catch(() => setError(true));
  }, [id]);

  return (
    <PublicPageShell>
      <main style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <a href="/#formations" style={{ fontSize: 13.5, color: 'var(--text-soft)' }}>
            ← Retour aux formations
          </a>

          {error && <p style={{ marginTop: 24, color: 'var(--danger)' }}>Cette formation est introuvable.</p>}

          {program && (
            <>
              <div className="eyebrow" style={{ marginTop: 24 }}>
                {program.degreeLevel ?? 'Formation'} · {program.durationYears} an{program.durationYears > 1 ? 's' : ''}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', margin: '8px 0 20px' }}>
                {program.name}
              </h1>
              <p style={{ fontSize: 15.5, color: 'var(--text-soft)', marginBottom: 32 }}>
                Rattaché au département{' '}
                <a href={`/departements/${program.department.id}`} style={{ color: 'var(--royal-2)', fontWeight: 600 }}>
                  {program.department.name}
                </a>
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-soft)', whiteSpace: 'pre-line' }}>
                {program.description || "Descriptif détaillé à venir pour cette formation."}
              </p>
            </>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}
