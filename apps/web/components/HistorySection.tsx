'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, HistoryMilestoneDto } from '../lib/api';

const FALLBACK: HistoryMilestoneDto[] = [
  { id: 'f1', year: '1998', title: 'Fondation du séminaire', text: "STHECROH ouvre ses portes à Port-au-Prince avec une première promotion de 24 étudiants en théologie pastorale." },
  { id: 'f2', year: '2006', title: 'Accréditation régionale', text: "Reconnaissance par les instances académiques régionales, permettant l'équivalence des diplômes dans plusieurs pays francophones." },
  { id: 'f3', year: '2014', title: 'Ouverture des départements', text: "Création des départements de Théologie Systématique, Langues Bibliques et Ministère Pastoral." },
  { id: 'f4', year: '2022', title: 'Premier programme hybride', text: "Lancement des premiers cours en ligne pour accompagner les étudiants dispersés dans la diaspora." },
  { id: 'f5', year: '2026', title: 'Plateforme numérique STHECROH', text: "Déploiement de la plateforme LMS complète : cours, examens, certificats vérifiables et administration unifiée." },
];

export function HistorySection() {
  const head = useReveal();
  const list = useReveal();
  const [items, setItems] = useState<HistoryMilestoneDto[]>(FALLBACK);

  useEffect(() => {
    contentApi.history().then((l) => l.length && setItems(l)).catch(() => {});
  }, []);

  return (
    <section id="histoire" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Notre histoire</div>
          <h2 className="section-title">Près de trente ans au service de la formation théologique.</h2>
          <p className="section-lede">
            De la première promotion à la plateforme numérique d&rsquo;aujourd&rsquo;hui, chaque étape a
            renforcé notre exigence académique.
          </p>
        </div>

        <div ref={list.ref} className={`timeline ${list.className}`}>
          {items.map((m) => (
            <div key={m.id} className="timeline-item">
              <span className="timeline-dot" />
              <div className="timeline-row">
                <span className="timeline-year">{m.year}</span>
                <div>
                  <h4>{m.title}</h4>
                  <p>{m.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
