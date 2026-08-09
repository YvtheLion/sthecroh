'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '../lib/ui-context';

const MINI_VALUES = [30, 55, 40, 70, 50, 85, 65];

export function Hero() {
  const { openModal } = useUI();
  const miniChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = miniChartRef.current;
    if (!container) return;
    container.innerHTML = '';
    MINI_VALUES.forEach((v, i) => {
      const bar = document.createElement('i');
      bar.style.height = '0%';
      container.appendChild(bar);
      setTimeout(() => {
        bar.style.height = v + '%';
      }, 200 + i * 90);
    });
  }, []);

  const scrollToPlatform = () => {
    document.getElementById('plateforme')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="hero" id="top">
      <svg className="hero-rose" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="90" stroke="var(--gold)" strokeWidth="0.6" opacity="0.5" />
        <circle cx="100" cy="100" r="70" stroke="var(--royal-2)" strokeWidth="0.6" opacity="0.4" />
        <g stroke="var(--gold)" strokeWidth="0.6" opacity="0.55">
          <path d="M100 10 L100 190" />
          <path d="M10 100 L190 100" />
          <path d="M35 35 L165 165" />
          <path d="M165 35 L35 165" />
          <path d="M100 10 A90 90 0 0 1 163.6 36.4" />
          <path d="M163.6 36.4 A90 90 0 0 1 190 100" />
        </g>
        <circle cx="100" cy="100" r="35" stroke="var(--royal-2)" strokeWidth="0.6" opacity="0.5" />
      </svg>

      <div className="container hero-grid">
        <div className="reveal in">
          <div className="eyebrow">Plateforme LMS Théologique</div>
          <h1>
            Former les <em>bâtisseurs de foi</em> de demain, avec exigence et clarté.
          </h1>
          <p className="lede">
            STHECROH réunit cours, suivi pédagogique, certification vérifiable et administration dans une
            seule plateforme pensée pour les séminaires théologiques francophones.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => openModal('login')}>
              Se connecter
            </button>
            <button className="btn btn-ghost" onClick={scrollToPlatform}>
              Voir la démo
            </button>
          </div>
          <div className="hero-trust">
            <div>
              <b>3 482+</b>Étudiants actifs
            </div>
            <div>
              <b>128</b>Cours disponibles
            </div>
            <div>
              <b>94%</b>Taux de réussite
            </div>
          </div>
        </div>

        <div className="browser-mock reveal in">
          <div className="browser-bar">
            <span />
            <span />
            <span />
            <div className="browser-url">app.sthecroh.edu / tableau-de-bord</div>
          </div>
          <div className="browser-body">
            <div className="mini-dash">
              <div className="mini-side">
                <div className="dot-line active" style={{ width: '80%' }} />
                <div className="dot-line" style={{ width: '60%' }} />
                <div className="dot-line" style={{ width: '70%' }} />
                <div className="dot-line" style={{ width: '50%' }} />
                <div className="dot-line" style={{ width: '65%' }} />
              </div>
              <div className="mini-cards">
                <div className="mini-card">
                  <b>72%</b>
                  <span>Progression moyenne</span>
                </div>
                <div className="mini-card">
                  <b>4</b>
                  <span>Cours en cours</span>
                </div>
                <div className="mini-chart" ref={miniChartRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
