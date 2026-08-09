'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { paymentsApi, paypalApi, PaymentDto, ApiError } from '../../lib/api';

const FEE_OPTIONS = [
  { label: 'Frais d’inscription', amountCents: 5000 },
  { label: 'Frais de scolarité — Semestre en cours', amountCents: 25000 },
  { label: 'Frais d’examen', amountCents: 3000 },
];

function statusPill(status: PaymentDto['status']) {
  if (status === 'SUCCEEDED') return <span className="pill ok">Payé</span>;
  if (status === 'PENDING') return <span className="pill warn">En attente</span>;
  return <span className="pill warn" style={{ background: '#fbe1e1', color: '#a33' }}>{status === 'FAILED' ? 'Échoué' : 'Remboursé'}</span>;
}

export function PaymentsView() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<PaymentDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payingIndex, setPayingIndex] = useState<number | null>(null);
  const justSucceeded = searchParams.get('success') === '1';
  const justCanceled = searchParams.get('canceled') === '1';

  const load = () => {
    if (!token) return;
    paymentsApi
      .mine(token)
      .then(setPayments)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger les paiements.'));
  };

  useEffect(load, [token]);

  const handlePay = async (index: number, provider: 'stripe' | 'paypal') => {
    if (!token) return;
    setPayingIndex(index);
    setError(null);
    try {
      const fee = FEE_OPTIONS[index];
      if (provider === 'paypal') {
        const { approveUrl } = await paypalApi.paymentCheckout(token, {
          amountCents: fee.amountCents,
          description: fee.label,
        });
        window.location.href = approveUrl;
        return;
      }
      const { checkoutUrl } = await paymentsApi.checkout(token, {
        amountCents: fee.amountCents,
        description: fee.label,
      });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Le paiement a été initié mais Stripe n’a pas renvoyé de lien de paiement.');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de démarrer le paiement.');
    } finally {
      setPayingIndex(null);
    }
  };

  return (
    <div>
      <div className="course-header">
        <h1>Paiements &amp; frais de scolarité</h1>
        <p>Réglez vos frais en ligne et retrouvez l&rsquo;historique de vos paiements.</p>
      </div>

      {justSucceeded && (
        <div style={{ background: 'var(--success)', color: '#fff', borderRadius: 12, padding: '12px 18px', marginBottom: 20, fontSize: 13.5, fontWeight: 600 }}>
          ✓ Paiement confirmé — merci ! Il apparaît ci-dessous dans votre historique.
        </div>
      )}
      {justCanceled && (
        <div style={{ background: 'var(--gray-100)', color: 'var(--text)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, fontSize: 13.5 }}>
          Paiement annulé — aucun montant n&rsquo;a été débité.
        </div>
      )}

      <div className="program-grid" style={{ marginBottom: 28 }}>
        {FEE_OPTIONS.map((fee, i) => (
          <div key={fee.label} className="program-row">
            <div>
              <h4>{fee.label}</h4>
              <span className="meta">{(fee.amountCents / 100).toFixed(2)} $</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" disabled={payingIndex !== null} onClick={() => handlePay(i, 'stripe')}>
                {payingIndex === i ? 'Redirection…' : '💳 Carte'}
              </button>
              <button className="btn btn-ghost btn-sm" disabled={payingIndex !== null} onClick={() => handlePay(i, 'paypal')}>
                🅿️ PayPal
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 20 }}>{error}</p>
      )}

      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 18, marginBottom: 14 }}>
        Historique des paiements
      </h3>
      <div className="admin-table-wrap">
        {!payments ? (
          <div className="admin-empty">Chargement…</div>
        ) : payments.length === 0 ? (
          <div className="admin-empty">Aucun paiement pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Reçu</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.description ?? '—'}</td>
                  <td>{(p.amountCents / 100).toFixed(2)} {p.currency}</td>
                  <td>{p.provider}</td>
                  <td>{statusPill(p.status)}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    {p.receiptUrl ? (
                      <a href={p.receiptUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--royal-2)', fontWeight: 600 }}>
                        Télécharger
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-soft)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
