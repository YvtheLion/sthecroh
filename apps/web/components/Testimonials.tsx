'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, Testimonial } from '../lib/api';

const FALLBACK: Testimonial[] = [
  { id: 'f1', quote: "La plateforme m'a permis de poursuivre mes études théologiques tout en servant ma paroisse à temps plein. Le suivi de progression est très motivant.", name: 'Marc Kouadio', role: 'Étudiant, Théologie Pastorale', initials: 'MK' },
  { id: 'f2', quote: "En tant qu'enseignante, je peux suivre mes 6 classes et corriger les devoirs depuis mon téléphone. Un vrai gain de temps administratif.", name: 'Dr. Ruth Kaboré', role: 'Enseignante, Herméneutique', initials: 'RK' },
  { id: 'f3', quote: 'La vérification des certificats en ligne a considérablement simplifié nos processus de recrutement pastoral. Un outil sérieux et fiable.', name: 'Pasteur Noël Ateba', role: 'Directeur, Église Renaissance', initials: 'PN' },
];

export function Testimonials() {
  const head = useReveal();
  const grid = useReveal();
  const [items, setItems] = useState<Testimonial[]>(FALLBACK);

  useEffect(() => {
    contentApi.testimonials().then((list) => list.length && setItems(list)).catch(() => {});
  }, []);

  return (
    <section id="temoignages" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div ref={head.ref} className={`section-head center ${head.className}`}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Témoignages</div>
          <h2 className="section-title">Ils se forment déjà avec STHECROH.</h2>
        </div>
        <div ref={grid.ref} className={`testi-grid ${grid.className}`}>
          {items.map((t) => (
            <div key={t.id} className="testi-card">
              <div className="stars">★★★★★</div>
              <p className="quote">« {t.quote} »</p>
              <div className="testi-who">
                <span className="avatar">{t.initials}</span>
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
