'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { adminOversightApi, AdminPaymentDto } from '../../lib/api';

function statusPill(status: string) {
  if (status === 'SUCCEEDED') return <span className="pill ok">Réussi</span>;
  if (status === 'PENDING') return <span className="pill warn">En attente</span>;
  return <span className="pill warn" style={{ background: '#fbe1e1', color: '#a33' }}>{status}</span>;
}

export function AdminPaymentsPanel() {
  const { token } = useAuth();
  const [rows, setRows] = useState<AdminPaymentDto[] | null>(null);

  useEffect(() => {
    if (!token) return;
    adminOversightApi.payments(token).then(setRows).catch(() => setRows([]));
  }, [token]);

  return (
    <div>
      <div className="admin-header">
        <h2>Paiements</h2>
      </div>
      <div className="admin-table-wrap">
        {!rows ? (
          <div className="admin-empty">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">Aucun paiement pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.user.firstName} {p.user.lastName}<br /><span style={{ color: 'var(--text-soft)', fontSize: 12 }}>{p.user.email}</span></td>
                  <td>{p.description ?? '—'}</td>
                  <td>{(p.amountCents / 100).toFixed(2)} {p.currency}</td>
                  <td>{p.provider}</td>
                  <td>{statusPill(p.status)}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
