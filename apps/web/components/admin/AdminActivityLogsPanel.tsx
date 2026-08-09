'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { adminOversightApi, ActivityLogDto } from '../../lib/api';

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Connexion',
  ENROLLMENT_CREATED: 'Inscription à un cours',
  PAYMENT_SUCCEEDED: 'Paiement réussi',
};

export function AdminActivityLogsPanel() {
  const { token } = useAuth();
  const [rows, setRows] = useState<ActivityLogDto[] | null>(null);

  useEffect(() => {
    if (!token) return;
    adminOversightApi.activityLogs(token).then(setRows).catch(() => setRows([]));
  }, [token]);

  return (
    <div>
      <div className="admin-header">
        <h2>Journaux d&rsquo;activité</h2>
      </div>
      <div className="admin-table-wrap">
        {!rows ? (
          <div className="admin-empty">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">Aucune activité enregistrée pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Détails</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <tr key={log.id}>
                  <td>{log.user ? `${log.user.firstName} ${log.user.lastName}` : '—'}</td>
                  <td>{ACTION_LABELS[log.action] ?? log.action}</td>
                  <td style={{ maxWidth: 300, fontSize: 12, color: 'var(--text-soft)' }}>
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
                  <td>{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
