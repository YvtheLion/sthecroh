'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { request, ApiError } from '../../lib/api';

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
}

export function AdminContactMessagesPanel() {
  const { token } = useAuth();
  const [rows, setRows] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    request<ContactMessageRow[]>('/contact-messages', { token })
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const toggleHandled = async (row: ContactMessageRow) => {
    if (!token) return;
    await request(`/contact-messages/${row.id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ handled: !row.handled }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!token) return;
    if (!confirm('Supprimer ce message ?')) return;
    await request(`/contact-messages/${id}`, { method: 'DELETE', token });
    load();
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Messages de contact</h2>
      </div>
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Chargement…</div>
        ) : error ? (
          <div className="admin-empty" style={{ color: 'var(--danger)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">Aucun message reçu pour le moment.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>De</th>
                <th>Sujet</th>
                <th>Message</th>
                <th>Reçu le</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}<br /><span style={{ color: 'var(--text-soft)', fontSize: 12 }}>{m.email}</span></td>
                  <td>{m.subject || '—'}</td>
                  <td style={{ maxWidth: 280 }}>{m.message.slice(0, 90)}{m.message.length > 90 ? '…' : ''}</td>
                  <td>{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`pill ${m.handled ? 'ok' : 'warn'}`}>{m.handled ? 'Traité' : 'En attente'}</span>
                  </td>
                  <td className="actions">
                    <button className="admin-icon-btn" title="Basculer le statut" onClick={() => toggleHandled(m)}>
                      ✓
                    </button>
                    <button className="admin-icon-btn danger" title="Supprimer" onClick={() => remove(m.id)}>
                      🗑
                    </button>
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
