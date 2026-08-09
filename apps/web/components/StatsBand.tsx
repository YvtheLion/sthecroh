'use client';

import { useEffect, useState } from 'react';
import { useReveal, useCountUp } from '../lib/use-reveal';
import { contentApi, PublicStats } from '../lib/api';

const FALLBACK: PublicStats = { studentsCount: 3482, coursesCount: 128, certificatesCount: 947, successRate: 94 };

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
  const [stats, setStats] = useState<PublicStats>(FALLBACK);

  useEffect(() => {
    contentApi
      .stats()
      .then((s) => {
        // On ne remplace que si la base contient déjà des données significatives
        if (s.studentsCount > 0 || s.coursesCount > 0) setStats(s);
      })
      .catch(() => {});
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
