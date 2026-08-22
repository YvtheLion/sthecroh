'use client';

import { useEffect, useState } from 'react';
import { PublicPageShell } from './PublicPageShell';
import { contentApi, HistoryMilestoneDto } from '../lib/api';

export function HistoryFullPage() {
  const [milestones, setMilestones] = useState<HistoryMilestoneDto[]>([]);

  useEffect(() => {
    contentApi.history().then(setMilestones).catch(() => {});
  }, []);

  return (
    <PublicPageShell>
      <main style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <a href="/#histoire" style={{ fontSize: 13.5, color: 'var(--text-soft)' }}>
            ← Retour à l&rsquo;accueil
          </a>
          <div className="eyebrow" style={{ marginTop: 24 }}>Notre parcours</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(30px,4vw,46px)', margin: '8px 0 16px' }}>
            Notre histoire
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-soft)', marginBottom: 56 }}>
            De la première promotion à la plateforme numérique d&rsquo;aujourd&rsquo;hui, chaque étape a
            renforcé notre exigence académique et notre ouverture au monde.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {milestones.map((m) => (
              <div key={m.id} style={{ display: 'flex', gap: 28 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                    fontSize: 28, color: 'var(--royal-2)', minWidth: 90, flexShrink: 0,
                  }}
                >
                  {m.year}
                </div>
                <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 24, paddingBottom: 4 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 8 }}>{m.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-soft)' }}>{m.text}</p>
                </div>
              </div>
            ))}
            {milestones.length === 0 && (
              <p style={{ color: 'var(--text-soft)' }}>Aucun jalon historique enregistré pour le moment.</p>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
