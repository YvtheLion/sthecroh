'use client';

import { useEffect, useState } from 'react';
import { siteSettingsApi, SocialLinkDto } from '../lib/api';
import { SocialIcon } from './SocialIcons';

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoChecked, setLogoChecked] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinkDto[]>([]);
  const [contactEmail, setContactEmail] = useState('contact@sthecroh.edu');
  const [contactPhone, setContactPhone] = useState('+509 38 00 00 00');
  const [contactAddress, setContactAddress] = useState('Port-au-Prince, Haïti');
  const [footerText, setFooterText] = useState('© 2026 STHECROH - Séminaire Théologique. Tous droits réservés.');

  useEffect(() => {
    siteSettingsApi
      .get()
      .then((s) => {
        setLogoUrl(s.logoUrl);
        setSocialLinks(s.socialLinks ?? []);
        if (s.contactEmail) setContactEmail(s.contactEmail);
        if (s.contactPhone) setContactPhone(s.contactPhone);
        if (s.contactAddress) setContactAddress(s.contactAddress);
        if (s.footerText) setFooterText(s.footerText);
      })
      .catch(() => {})
      .finally(() => setLogoChecked(true));
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
              ) : logoChecked ? (
                <span className="brand-mark" />
              ) : (
                <span className="brand-mark-spacer" />
              )}
              <span>STHECROH</span>
            </div>
            <p>
              Séminaire Théologique - Former avec rigueur, servir avec foi. Plateforme LMS dédiée à la
              formation théologique francophone.
            </p>
            {socialLinks.length > 0 && (
              <div className="social-row">
                {socialLinks.map((link) => (
                  <a key={link.platform} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform}>
                    <SocialIcon platform={link.platform} size={16} />
                  </a>
                ))}
              </div>
            )}
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
              <li>{contactEmail}</li>
              <li>{contactPhone}</li>
              <li>{contactAddress}</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{footerText}</span>
          <span>Confidentialité · Conditions d&rsquo;utilisation</span>
        </div>
      </div>
    </footer>
  );
}
