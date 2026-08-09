'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { adminOversightApi, AdminDonationDto } from '../../lib/api';

export function AdminDonationsPanel() {
  const { token } = useAuth();
  const [rows, setRows] = useState<AdminDonationDto[] | null>(null);

  useEffect(() => {
    if (!token) return;
    adminOversightApi.donations(token).then(setRows).catch(() => setRows([]));
  }, [token]);

  return (
    <div>
      <div className="admin-header">
        <h2>Dons</h2>
      </div>
      <div className="admin-table-wrap">
        {!rows ? (
          <div className="admin-empty">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">Aucun don reçu pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Donateur</th>
                <th>Montant</th>
                <th>Fréquence</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>{d.donorName ?? 'Anonyme'}<br /><span style={{ color: 'var(--text-soft)', fontSize: 12 }}>{d.donorEmail ?? '—'}</span></td>
                  <td>{(d.amountCents / 100).toFixed(2)} {d.currency}</td>
                  <td>{d.frequency === 'MONTHLY' ? 'Mensuel' : 'Ponctuel'}</td>
                  <td>{d.provider}</td>
                  <td>
                    <span className={`pill ${d.status === 'SUCCEEDED' ? 'ok' : 'warn'}`}>{d.status}</span>
                  </td>
                  <td>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
