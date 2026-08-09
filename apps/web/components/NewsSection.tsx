'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, NewsPostDto } from '../lib/api';

const FALLBACK: NewsPostDto[] = [
  { id: 'f1', date: '2026-07-03', title: 'Ouverture des inscriptions pour la rentrée 2026-2027', excerpt: "Les inscriptions pour tous les programmes de licence et de master sont désormais ouvertes en ligne." },
  { id: 'f2', date: '2026-06-18', title: 'STHECROH lance sa plateforme numérique complète', excerpt: "Cours en ligne, certificats vérifiables et espaces dédiés : la nouvelle plateforme LMS est en ligne." },
  { id: 'f3', date: '2026-06-02', title: '947 diplômes délivrés depuis la création du séminaire', excerpt: "Un cap symbolique franchi lors de la dernière cérémonie de graduation du campus principal." },
];

export function NewsSection() {
  const head = useReveal();
  const grid = useReveal();
  const [items, setItems] = useState<NewsPostDto[]>(FALLBACK);

  useEffect(() => {
    contentApi.news().then((l) => l.length && setItems(l)).catch(() => {});
  }, []);

  return (
    <section id="actualites" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Actualités</div>
          <h2 className="section-title">Les dernières nouvelles du séminaire.</h2>
        </div>
        <div ref={grid.ref} className={`news-grid ${grid.className}`}>
          {items.map((n) => (
            <article key={n.id} className="news-card">
              <span className="news-date">
                {new Date(n.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <h4>{n.title}</h4>
              <p>{n.excerpt}</p>
              <a href="#">Lire la suite →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
