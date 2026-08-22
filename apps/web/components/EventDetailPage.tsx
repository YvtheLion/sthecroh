'use client';

import { useEffect, useState } from 'react';
import { PublicPageShell } from './PublicPageShell';
import { detailApi, EventItem } from '../lib/api';

export function EventDetailPage({ id }: { id: string }) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    detailApi.event(id).then(setEvent).catch(() => setError(true));
  }, [id]);

  const dateLabel = event
    ? new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <PublicPageShell>
      <main style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <a href="/#evenements" style={{ fontSize: 13.5, color: 'var(--text-soft)' }}>
            ← Retour aux événements
          </a>

          {error && <p style={{ marginTop: 24, color: 'var(--danger)' }}>Cet événement est introuvable.</p>}

          {event && (
            <>
              <div className="eyebrow" style={{ marginTop: 24, textTransform: 'capitalize' }}>{dateLabel}</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', margin: '8px 0 12px' }}>
                {event.title}
              </h1>
              <p style={{ fontSize: 15.5, color: 'var(--text-soft)', marginBottom: 32 }}>📍 {event.place}</p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-soft)', whiteSpace: 'pre-line' }}>
                {event.description || "Plus de détails sur cet événement seront communiqués prochainement."}
              </p>
            </>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}
