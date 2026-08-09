'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { request, ApiError } from '../../lib/api';

interface AdminUserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'ARCHIVED';
  title: string | null;
  createdAt: string;
}

const ROLES = ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'] as const;
const STATUSES = ['ACTIVE', 'SUSPENDED', 'PENDING', 'ARCHIVED'] as const;

export function AdminUsersPanel() {
  const { token, user: currentUser } = useAuth();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    request<AdminUserRow[]>('/users', { token })
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const updateRole = async (id: string, role: string) => {
    if (!token) return;
    setSavingId(id);
    try {
      await request(`/users/${id}/role`, { method: 'PATCH', token, body: JSON.stringify({ role }) });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Impossible de modifier le rôle (réservé Super Admin).');
    } finally {
      setSavingId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!token) return;
    setSavingId(id);
    try {
      await request(`/users/${id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Impossible de modifier le statut.');
    } finally {
      setSavingId(null);
    }
  };

  const removeUser = async (id: string) => {
    if (!token) return;
    if (!confirm('Supprimer définitivement ce compte ?')) return;
    try {
      await request(`/users/${id}`, { method: 'DELETE', token });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Suppression impossible (réservé Super Admin).');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Utilisateurs</h2>
      </div>
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Chargement…</div>
        ) : error ? (
          <div className="admin-empty" style={{ color: 'var(--danger)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">Aucun utilisateur.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', fontSize: 12.5 }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={u.status}
                      disabled={savingId === u.id}
                      onChange={(e) => updateStatus(u.id, e.target.value)}
                      style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', fontSize: 12.5 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="actions">
                    <button
                      className="admin-icon-btn danger"
                      title="Supprimer"
                      disabled={u.id === currentUser?.id}
                      onClick={() => removeUser(u.id)}
                    >
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
