'use client';

import { useEffect, useState } from 'react';
import { siteSettingsApi } from '../lib/api';

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    siteSettingsApi.get().then((s) => setLogoUrl(s.logoUrl)).catch(() => {});
  }, []);

  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand" style={{ color: '#fff' }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="STHECROH" className="brand-logo-img" />
              ) : (
                <span className="brand-mark" />
              )}
              <span>STHECROH</span>
            </div>
            <p>
              Séminaire Théologique - Former avec rigueur, servir avec foi. Plateforme LMS dédiée à la
              formation théologique francophone.
            </p>
            <div className="social-row">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="YouTube">▶</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Instagram">◎</a>
            </div>
          </div>
          <div>
            <h5>Plateforme</h5>
            <ul>
              <li><a href="#plateforme">Aperçu</a></li>
              <li><a href="#cours">Cours &amp; leçons</a></li>
              <li><a href="#certificats">Certificats</a></li>
              <li><a href="#dons">Dons &amp; paiements</a></li>
            </ul>
          </div>
          <div>
            <h5>Institution</h5>
            <ul>
              <li><a href="#presentation">Notre mission</a></li>
              <li><a href="#temoignages">Témoignages</a></li>
              <li><a href="#enseignants">Corps professoral</a></li>
              <li><a href="#contact">Admissions</a></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li>contact@sthecroh.edu</li>
              <li>+509 38 00 00 00</li>
              <li>Port-au-Prince, Haïti</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 STHECROH - Séminaire Théologique. Tous droits réservés.</span>
          <span>Confidentialité · Conditions d&rsquo;utilisation</span>
        </div>
      </div>
    </footer>
  );
}
