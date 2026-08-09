'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { adminApi, ApiError } from '../../lib/api';

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'date' | 'select';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface Props {
  resource: string; // segment d'URL API, ex: "testimonials"
  title: string;
  fields: FieldDef[];
  columns?: string[]; // sous-ensemble de fields.key à afficher dans la table (défaut: tous)
  listAll?: boolean; // passe ?all=true (voir aussi le contenu non publié)
}

function defaultForField(f: FieldDef) {
  if (f.type === 'checkbox') return true;
  if (f.type === 'number') return 0;
  if (f.type === 'date') return new Date().toISOString().slice(0, 10);
  return '';
}

function displayValue(row: any, key: string, type: FieldType, options?: { value: string; label: string }[]) {
  const v = row[key];
  if (type === 'checkbox') return v ? '✅' : '—';
  if (type === 'date') return v ? new Date(v).toLocaleDateString('fr-FR') : '—';
  if (type === 'select' && options) return options.find((o) => o.value === v)?.label ?? v ?? '—';
  if (typeof v === 'string' && v.length > 60) return v.slice(0, 60) + '…';
  return v ?? '—';
}

export function AdminResourceTable({ resource, title, fields, columns, listAll = true }: Props) {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const displayCols = columns ?? fields.map((f) => f.key);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    adminApi
      .list(resource, token, { all: listAll })
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [resource, token, listAll]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => (initial[f.key] = defaultForField(f)));
    setFormData(initial);
    setEditing(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      initial[f.key] = f.type === 'date' && row[f.key] ? new Date(row[f.key]).toISOString().slice(0, 10) : row[f.key];
    });
    setFormData(initial);
    setEditing(row);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!token) return;
    if (!confirm('Supprimer définitivement cet élément ?')) return;
    try {
      await adminApi.remove(resource, token, row.id);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await adminApi.update(resource, token, editing.id, formData);
      } else {
        await adminApi.create(resource, token, formData);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>{title}</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Ajouter
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Chargement…</div>
        ) : error ? (
          <div className="admin-empty" style={{ color: 'var(--danger)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">Aucun élément pour le moment. Cliquez sur "+ Ajouter".</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {displayCols.map((key) => (
                  <th key={key}>{fields.find((f) => f.key === key)?.label ?? key}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {displayCols.map((key) => (
                    <td key={key}>{displayValue(row, key, fields.find((f) => f.key === key)?.type ?? 'text', fields.find((f) => f.key === key)?.options)}</td>
                  ))}
                  <td className="actions">
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(row)}>
                      ✎
                    </button>
                    <button className="admin-icon-btn danger" title="Supprimer" onClick={() => handleDelete(row)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={`modal-overlay${modalOpen ? ' show' : ''}`} onClick={() => setModalOpen(false)}>
        <div className="modal-box" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setModalOpen(false)}>
            ✕
          </button>
          <h3>{editing ? 'Modifier' : 'Ajouter'} — {title}</h3>
          <form onSubmit={handleSave} style={{ marginTop: 20 }}>
            <div className="admin-form-grid">
              {fields.map((f) => (
                <div key={f.key} className={`field ${f.type === 'textarea' ? 'full' : ''}`}>
                  <label>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      required={f.required}
                      value={String(formData[f.key] ?? '')}
                      onChange={(e) => setFormData((d) => ({ ...d, [f.key]: e.target.value }))}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      required={f.required}
                      value={String(formData[f.key] ?? '')}
                      onChange={(e) => setFormData((d) => ({ ...d, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }}
                    >
                      <option value="">—</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <div style={{ paddingTop: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!formData[f.key]}
                        onChange={(e) => setFormData((d) => ({ ...d, [f.key]: e.target.checked }))}
                        style={{ width: 18, height: 18 }}
                      />
                    </div>
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      required={f.required}
                      value={String(formData[f.key] ?? '')}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            {formError && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 14 }}>{formError}</p>}
            <button className="btn btn-primary btn-block" type="submit" disabled={saving} style={{ marginTop: 20 }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
