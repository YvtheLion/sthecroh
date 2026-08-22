'use client';

import { useEffect, useState } from 'react';
import { PublicPageShell } from './PublicPageShell';
import { siteSettingsApi, PresentationContentDto } from '../lib/api';

const DEFAULT_CONTENT: PresentationContentDto = {
  mission:
    "Offrir une formation théologique rigoureuse, accessible et vérifiable, portée par une technologie au service de la fidélité pédagogique. STHECROH forme des pasteurs, enseignants et serviteurs capables d'annoncer la Parole avec exactitude, discernement et intégrité, où qu'ils se trouvent dans le monde.",
  vision:
    "Devenir une référence internationale de la formation théologique francophone, en connectant des étudiants de tous les continents à un enseignement structuré, certifié et fidèle aux Écritures — sans barrière de distance ni de frontière.",
  valeurs:
    "Rigueur académique, intégrité, accessibilité et excellence pédagogique guident chaque cours, chaque évaluation, chaque certification délivrée par le séminaire.",
  pillars: [
    { title: '01 — Rigueur', text: 'Un corpus académique structuré, validé par un corps professoral qualifié et exigeant.' },
    { title: '02 — Accessibilité', text: 'Une plateforme légère et mobile, pensée pour être suivie depuis n\'importe quel pays du monde.' },
    { title: '03 — Vérifiabilité', text: 'Chaque certificat délivré est traçable et vérifiable publiquement, à tout moment.' },
  ],
};

const LABELS: Record<string, string> = { mission: 'Notre Mission', vision: 'Notre Vision', valeurs: 'Nos Valeurs' };

export function AboutDetailPage({ slug }: { slug: string }) {
  const [content, setContent] = useState<PresentationContentDto>(DEFAULT_CONTENT);

  useEffect(() => {
    siteSettingsApi
      .get()
      .then((s) => {
        if (s.presentationContent) setContent(s.presentationContent);
      })
      .catch(() => {});
  }, []);

  const title = LABELS[slug] ?? 'STHECROH';
  const body = slug === 'mission' ? content.mission : slug === 'vision' ? content.vision : content.valeurs;

  return (
    <PublicPageShell>
      <main style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <a href="/#presentation" style={{ fontSize: 13.5, color: 'var(--text-soft)' }}>
            ← Retour à l&rsquo;accueil
          </a>
          <div className="eyebrow" style={{ marginTop: 24 }}>Qui sommes-nous</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(30px,4vw,46px)', margin: '8px 0 28px' }}>
            {title}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-soft)', whiteSpace: 'pre-line' }}>{body}</p>

          <div className="pillar-row" style={{ marginTop: 60 }}>
            {content.pillars.map((p) => (
              <div key={p.title}>
                <h4>{p.title}</h4>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
