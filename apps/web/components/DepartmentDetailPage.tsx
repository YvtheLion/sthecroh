'use client';

import { useEffect, useState } from 'react';
import { PublicPageShell } from './PublicPageShell';
import { detailApi, DepartmentDetailDto } from '../lib/api';

export function DepartmentDetailPage({ id }: { id: string }) {
  const [department, setDepartment] = useState<DepartmentDetailDto | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    detailApi.department(id).then(setDepartment).catch(() => setError(true));
  }, [id]);

  return (
    <PublicPageShell>
      <main style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <a href="/#formations" style={{ fontSize: 13.5, color: 'var(--text-soft)' }}>
            ← Retour aux départements
          </a>

          {error && <p style={{ marginTop: 24, color: 'var(--danger)' }}>Ce département est introuvable.</p>}

          {department && (
            <>
              <div className="eyebrow" style={{ marginTop: 24 }}>Département</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', margin: '8px 0 20px' }}>
                {department.name}
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-soft)', whiteSpace: 'pre-line', marginBottom: 40 }}>
                {department.description || "Descriptif détaillé à venir pour ce département."}
              </p>

              {department.programs.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, marginBottom: 16 }}>Formations de ce département</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {department.programs.map((p) => (
                      <a
                        key={p.id}
                        href={`/formations/${p.id}`}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '14px 18px', border: '1px solid var(--border)', borderRadius: 12,
                          fontSize: 14.5,
                        }}
                      >
                        <span>{p.name}</span>
                        <span style={{ color: 'var(--text-soft)' }}>
                          {p.durationYears} an{p.durationYears > 1 ? 's' : ''} · {p.degreeLevel} →
                        </span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}
