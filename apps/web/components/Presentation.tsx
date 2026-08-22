'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { siteSettingsApi, PresentationContentDto } from '../lib/api';

const DEFAULT_CONTENT: PresentationContentDto = {
  mission:
    "Offrir une formation théologique rigoureuse, accessible et vérifiable, portée par une technologie au service de la fidélité pédagogique.",
  vision:
    "Devenir une référence internationale de la formation théologique francophone, en connectant des étudiants de tous les continents à un enseignement structuré et certifié.",
  valeurs:
    'Rigueur académique, intégrité, accessibilité et excellence pédagogique guident chaque cours, chaque évaluation, chaque certification.',
  pillars: [
    { title: '01 — Rigueur', text: 'Un corpus académique structuré, validé par un corps professoral qualifié et exigeant.' },
    { title: '02 — Accessibilité', text: "Une plateforme légère et mobile, pensée pour être suivie depuis n'importe quel pays du monde." },
    { title: '03 — Vérifiabilité', text: 'Chaque certificat délivré est traçable et vérifiable publiquement, à tout moment.' },
  ],
};

const ICONS: Record<string, React.ReactNode> = {
  Mission: (
    <>
      <path d="M12 2 L12 22 M2 12 L22 12" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  Vision: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  Valeurs: <path d="m12 2 2.9 6.3 6.9.9-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-.9L12 2Z" />,
};

export function Presentation() {
  const head = useReveal();
  const cards = useReveal();
  const pillars = useReveal();
  const [content, setContent] = useState<PresentationContentDto>(DEFAULT_CONTENT);

  useEffect(() => {
    siteSettingsApi
      .get()
      .then((s) => {
        if (s.presentationContent) setContent(s.presentationContent);
      })
      .catch(() => {});
  }, []);

  const values = [
    { title: 'Mission', slug: 'mission', text: content.mission },
    { title: 'Vision', slug: 'vision', text: content.vision },
    { title: 'Valeurs', slug: 'valeurs', text: content.valeurs },
  ];

  return (
    <section id="presentation">
      <div className="container">
        <div ref={head.ref} className={`section-head center ${head.className}`}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Qui sommes-nous</div>
          <h2 className="section-title">Une pédagogie fidèle, portée par la technologie.</h2>
          <p className="section-lede">
            STHECROH accompagne des générations de pasteurs, enseignants et serviteurs depuis sa fondation.
            Notre plateforme numérique prolonge cette exigence académique dans un cadre moderne, accessible
            et vérifiable, partout dans le monde.
          </p>
        </div>

        <div ref={cards.ref} className={`grid-3 ${cards.className}`}>
          {values.map((v) => (
            <a key={v.title} href={`/a-propos/${v.slug}`} className="value-card" style={{ display: 'block', cursor: 'pointer' }}>
              <div className="value-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {ICONS[v.title]}
                </svg>
              </div>
              <h3>{v.title}</h3>
              <p>{v.text.length > 160 ? v.text.slice(0, 157) + '…' : v.text}</p>
              <span style={{ fontSize: 13, color: 'var(--royal-2)', fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
                En savoir plus →
              </span>
            </a>
          ))}
        </div>

        <div ref={pillars.ref} className={`pillar-row ${pillars.className}`}>
          {content.pillars.map((p) => (
            <div key={p.title}>
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
