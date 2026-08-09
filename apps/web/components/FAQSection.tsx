'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, FaqItemDto } from '../lib/api';

const FALLBACK: FaqItemDto[] = [
  { id: 'f1', question: 'Les diplômes STHECROH sont-ils reconnus ?', answer: "Oui. Nos programmes sont accrédités par les instances académiques régionales, avec des équivalences reconnues dans plusieurs pays francophones." },
  { id: 'f2', question: 'Puis-je étudier entièrement en ligne ?', answer: 'La majorité de nos cours sont disponibles en ligne, avec vidéos, PDF et visioconférence. Certains programmes nécessitent une présence ponctuelle sur le campus.' },
  { id: 'f3', question: 'Comment sont vérifiés les certificats ?', answer: 'Chaque certificat et diplôme possède un identifiant unique et un QR code renvoyant vers une page de vérification publique, sans authentification requise.' },
  { id: 'f4', question: 'Quels moyens de paiement acceptez-vous ?', answer: 'Carte bancaire via Stripe, PayPal, ainsi que Orange Money, MTN Mobile Money et Airtel Money selon votre pays.' },
  { id: 'f5', question: 'Comment faire un don au séminaire ?', answer: "La section Dons de la plateforme permet un don ponctuel ou mensuel, avec reçu automatique par e-mail et suivi de l'impact de votre contribution." },
];

export function FAQSection() {
  const head = useReveal();
  const list = useReveal();
  const [items, setItems] = useState<FaqItemDto[]>(FALLBACK);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    contentApi.faq().then((l) => l.length && setItems(l)).catch(() => {});
  }, []);

  return (
    <section id="faq">
      <div className="container">
        <div ref={head.ref} className={`section-head center ${head.className}`}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Questions fréquentes</div>
          <h2 className="section-title">Tout ce qu&rsquo;il faut savoir avant de commencer.</h2>
        </div>

        <div ref={list.ref} className={`faq-list ${list.className}`}>
          {items.map((f, i) => (
            <div key={f.id} className="faq-item">
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                {f.question}
                <span className={`plus${open === i ? ' open' : ''}`}>+</span>
              </button>
              {open === i && <div className="faq-answer">{f.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
