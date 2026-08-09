'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { donationsApi, paypalApi, DonationImpactDto, ApiError } from '../lib/api';

const AMOUNTS = [10, 25, 50, 100];
const METHODS = [
  { id: 'card', label: '💳 Carte' },
  { id: 'mobile', label: '📱 Mobile Money' },
  { id: 'paypal', label: '🅿️ PayPal' },
];

export function DonationsSection() {
  const head = useReveal();
  const grid = useReveal();
  const impactReveal = useReveal();

  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState('card');
  const [frequency, setFrequency] = useState<'ONE_TIME' | 'MONTHLY'>('ONE_TIME');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impact, setImpact] = useState<DonationImpactDto | null>(null);

  useEffect(() => {
    donationsApi.impact().then(setImpact).catch(() => {});
  }, []);

  const displayAmount = custom || amount;

  const handleDonate = async () => {
    if (!email.trim()) {
      setError('Une adresse e-mail est nécessaire pour recevoir votre reçu.');
      return;
    }
    if (method === 'mobile') {
      setError('Mobile Money sera disponible dès qu’un compte marchand Orange/MTN/Airtel sera configuré.');
      return;
    }
    if (method === 'paypal' && frequency === 'MONTHLY') {
      setError('Les dons mensuels via PayPal ne sont pas encore disponibles — choisissez "Carte" ou un don ponctuel.');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      if (method === 'paypal') {
        const { approveUrl } = await paypalApi.donationCheckout({
          donorName: name.trim() || undefined,
          donorEmail: email.trim(),
          amountCents: Number(displayAmount) * 100,
          currency: 'USD',
        });
        window.location.href = approveUrl;
        return;
      }

      const { checkoutUrl } = await donationsApi.checkout({
        donorName: name.trim() || undefined,
        donorEmail: email.trim(),
        amountCents: Number(displayAmount) * 100,
        currency: 'USD',
        frequency,
      });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Le don a été initié mais Stripe n’a pas renvoyé de lien de paiement.');
        setProcessing(false);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `${err.message}`
          : 'Impossible de démarrer le don pour le moment.',
      );
      setProcessing(false);
    }
  };

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

  return (
    <section id="dons" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Paiement &amp; dons</div>
          <h2 className="section-title">Soutenir la formation, en toute confiance.</h2>
          <p className="section-lede">
            Frais de scolarité ou dons libres : un paiement sécurisé, rapide, accessible depuis
            n&rsquo;importe où.
          </p>
        </div>

        {impact && (
          <div ref={impactReveal.ref} className={`impact-band ${impactReveal.className}`}>
            <div className="impact-card">
              <div className="num">{(impact.totalRaisedCents / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} $</div>
              <div className="lbl">Collectés à ce jour</div>
            </div>
            <div className="impact-card">
              <div className="num">{impact.donorCount}</div>
              <div className="lbl">Donateurs</div>
            </div>
            <div className="impact-card">
              <div className="num">{impact.causesFunded}</div>
              <div className="lbl">Projets soutenus</div>
            </div>
          </div>
        )}

        <div ref={grid.ref} className={`pay-grid ${grid.className}`}>
          <div>
            <div className="card-visual">
              <div className="chip" />
              <div className="num">{cardNumber || '4242\u00A0\u00A04242\u00A0\u00A04242\u00A0\u00A04242'}</div>
              <div className="foot">
                <span>{(name || 'J. B. NKURUNZIZA').toUpperCase()}</span>
                <span>12/28</span>
              </div>
            </div>
            <div className="method-row">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`method-chip${method === m.id ? ' active' : ''}`}
                  onClick={() => setMethod(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="method-row">
              <button
                className={`method-chip${frequency === 'ONE_TIME' ? ' active' : ''}`}
                onClick={() => setFrequency('ONE_TIME')}
              >
                Don ponctuel
              </button>
              <button
                className={`method-chip${frequency === 'MONTHLY' ? ' active' : ''}`}
                onClick={() => setFrequency('MONTHLY')}
              >
                Don mensuel
              </button>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>
              Paiement sécurisé par Stripe. Vous serez redirigé vers une page de paiement chiffrée —
              aucune donnée bancaire n&rsquo;est stockée sur nos serveurs.
            </p>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: 18, fontSize: 16 }}>Faire un don</h4>
            <div className="amount-grid">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  className={`amount-chip${!custom && amount === a ? ' active' : ''}`}
                  onClick={() => {
                    setAmount(a);
                    setCustom('');
                  }}
                >
                  {a} $
                </button>
              ))}
            </div>
            <div className="field">
              <label>Montant personnalisé</label>
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
                placeholder="Saisir un montant (USD)"
              />
            </div>
            <div className="field">
              <label>Nom complet</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean-Baptiste Nkurunziza" />
            </div>
            <div className="field">
              <label>Adresse e-mail (pour votre reçu)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
              />
            </div>
            <div className="field">
              <label>Numéro de carte (aperçu — la saisie réelle se fait sur la page Stripe sécurisée)</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
              />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 14 }}>{error}</p>}
            <button className="btn btn-gold btn-block" disabled={processing} onClick={handleDonate}>
              {processing ? 'Redirection…' : `Faire un don de ${displayAmount} $${frequency === 'MONTHLY' ? ' / mois' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
