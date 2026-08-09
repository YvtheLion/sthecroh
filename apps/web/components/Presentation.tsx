'use client';

import { useReveal } from '../lib/use-reveal';

const VALUES = [
  {
    title: 'Mission',
    text: "Offrir une formation théologique rigoureuse, accessible et vérifiable, portée par une technologie au service de la fidélité pédagogique.",
    icon: (
      <>
        <path d="M12 2 L12 22 M2 12 L22 12" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
  {
    title: 'Vision',
    text: "Devenir la référence numérique des séminaires théologiques francophones d'ici 2030, en formant des serviteurs équipés pour un monde en mutation.",
    icon: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    title: 'Valeurs',
    text: 'Rigueur académique, intégrité, accessibilité et excellence pédagogique guident chaque cours, chaque évaluation, chaque certification.',
    icon: <path d="m12 2 2.9 6.3 6.9.9-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-.9L12 2Z" />,
  },
];

const PILLARS = [
  ['01 — Rigueur', 'Un corpus académique structuré, validé par un corps professoral qualifié et exigeant.'],
  ['02 — Accessibilité', "Une plateforme pensée pour l'Afrique francophone : légère, mobile, disponible hors-ligne."],
  ['03 — Vérifiabilité', 'Chaque certificat délivré est traçable et vérifiable publiquement, à tout moment.'],
];

export function Presentation() {
  const head = useReveal();
  const cards = useReveal();
  const pillars = useReveal();

  return (
    <section id="presentation">
      <div className="container">
        <div ref={head.ref} className={`section-head center ${head.className}`}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Qui sommes-nous</div>
          <h2 className="section-title">Une pédagogie fidèle, portée par la technologie.</h2>
          <p className="section-lede">
            STHECROH accompagne des générations de pasteurs, enseignants et serviteurs depuis sa fondation.
            Notre plateforme numérique prolonge cette exigence académique dans un cadre moderne, accessible
            et vérifiable.
          </p>
        </div>

        <div ref={cards.ref} className={`grid-3 ${cards.className}`}>
          {VALUES.map((v) => (
            <div key={v.title} className="value-card">
              <div className="value-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {v.icon}
                </svg>
              </div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>

        <div ref={pillars.ref} className={`pillar-row ${pillars.className}`}>
          {PILLARS.map(([title, text]) => (
            <div key={title}>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
