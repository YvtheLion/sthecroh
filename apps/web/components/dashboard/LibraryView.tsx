'use client';

import { useEffect, useState } from 'react';
import { libraryApi, LibraryResourceDto } from '../../lib/api';

export function LibraryView() {
  const [resources, setResources] = useState<LibraryResourceDto[] | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    libraryApi.list().then(setResources).catch(() => setResources([]));
  }, []);

  if (!resources) {
    return <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Chargement…</p>;
  }

  const categories = Array.from(new Set(resources.map((r) => r.category).filter(Boolean))) as string[];

  const filtered = resources.filter((r) => {
    const matchesCategory = !category || r.category === category;
    const matchesSearch =
      !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.author ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="course-header">
        <h1>Bibliothèque numérique</h1>
        <p>Ouvrages, supports et ressources mis à disposition par le séminaire.</p>
      </div>

      <div className="field" style={{ maxWidth: 360, marginBottom: 20 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un titre ou un auteur…"
        />
      </div>

      {categories.length > 0 && (
        <div className="lib-filters">
          <button className={`lib-filter-chip${!category ? ' active' : ''}`} onClick={() => setCategory(null)}>
            Tout
          </button>
          {categories.map((c) => (
            <button key={c} className={`lib-filter-chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Aucune ressource ne correspond à votre recherche.</p>
      ) : (
        <div className="lib-grid">
          {filtered.map((r) => (
            <div key={r.id} className="lib-card">
              <div className="cover">📖</div>
              {r.category && <span className="cat">{r.category}</span>}
              <h4>{r.title}</h4>
              {r.author && <div className="author">{r.author}</div>}
              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary btn-block">
                Consulter
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
