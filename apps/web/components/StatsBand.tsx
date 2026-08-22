'use client';

import { useEffect, useState } from 'react';
import { useReveal, useCountUp } from '../lib/use-reveal';
import { contentApi, PublicStats } from '../lib/api';

const EMPTY: PublicStats = { studentsCount: 0, coursesCount: 0, certificatesCount: 0, successRate: 0 };

function Stat({ target, suffix, label }: { target: number; suffix?: string; label: string }) {
  const { ref, value } = useCountUp(target, suffix);
  return (
    <div>
      <div className="stat-num" ref={ref}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function StatsBand() {
  const band = useReveal();
  // Toujours les vrais chiffres calculés depuis la base de données — jamais de valeur inventée,
  // même en cas d'échec de la requête (mieux vaut afficher 0 que mentir).
  const [stats, setStats] = useState<PublicStats>(EMPTY);

  useEffect(() => {
    contentApi.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <section id="stats">
      <div className="container">
        <div ref={band.ref} className={`stats-band ${band.className}`}>
          <div className="stats-grid">
            <Stat target={stats.studentsCount} label="Étudiants inscrits" />
            <Stat target={stats.coursesCount} label="Cours disponibles" />
            <Stat target={stats.certificatesCount} label="Diplômes délivrés" />
            <Stat target={stats.successRate} suffix="%" label="Taux de réussite" />
          </div>
        </div>
      </div>
    </section>
  );
}
