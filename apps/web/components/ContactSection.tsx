'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { useUI } from '../lib/ui-context';
import { contactApi, siteSettingsApi, ApiError } from '../lib/api';

export function ContactSection() {
  const head = useReveal();
  const grid = useReveal();
  const { showToast } = useUI();
  const [sending, setSending] = useState(false);
  const [contactEmail, setContactEmail] = useState('contact@sthecroh.edu');
  const [contactPhone, setContactPhone] = useState('+509 38 00 00 00');
  const [contactAddress, setContactAddress] = useState('Port-au-Prince, Haïti');

  useEffect(() => {
    siteSettingsApi
      .get()
      .then((s) => {
        if (s.contactEmail) setContactEmail(s.contactEmail);
        if (s.contactPhone) setContactPhone(s.contactPhone);
        if (s.contactAddress) setContactAddress(s.contactAddress);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    setSending(true);
    try {
      await contactApi.send({
        name: String(data.get('name')),
        email: String(data.get('email')),
        subject: String(data.get('subject') || ''),
        message: String(data.get('message')),
      });
      showToast('Message envoyé — nous vous répondrons sous 48h');
      form.reset();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Impossible d'envoyer le message pour le moment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact">
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Contact</div>
          <h2 className="section-title">Une question ? Écrivez-nous.</h2>
          <p className="section-lede">
            Notre équipe des admissions vous répond sous 48h, du lundi au vendredi.
          </p>
        </div>

        <div ref={grid.ref} className={`contact-grid ${grid.className}`}>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="field-row">
              <div className="field">
                <label>Nom complet</label>
                <input name="name" required placeholder="Votre nom" />
              </div>
              <div className="field">
                <label>Adresse e-mail</label>
                <input name="email" required type="email" placeholder="vous@exemple.com" />
              </div>
            </div>
            <div className="field">
              <label>Sujet</label>
              <input name="subject" placeholder="Admissions, plateforme, dons…" />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea name="message" required rows={5} placeholder="Votre message" />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={sending}>
              {sending ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="contact-map">
              <iframe
                title="Localisation STHECROH — Port-au-Prince"
                src="https://www.google.com/maps?q=Port-au-Prince,Haiti&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="contact-info-grid">
              <div className="contact-info-card">
                <div className="k">Adresse</div>
                <div className="v">{contactAddress}</div>
              </div>
              <div className="contact-info-card">
                <div className="k">Téléphone</div>
                <div className="v">{contactPhone}</div>
              </div>
              <div className="contact-info-card">
                <div className="k">E-mail</div>
                <div className="v">{contactEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
