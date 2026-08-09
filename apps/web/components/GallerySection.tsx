'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, GalleryImageDto } from '../lib/api';

const FALLBACK: GalleryImageDto[] = [
  { id: 'f1', label: 'Campus principal', imageUrl: null, tall: true },
  { id: 'f2', label: 'Bibliothèque numérique', imageUrl: null, tall: false },
  { id: 'f3', label: 'Salle de conférence', imageUrl: null, tall: false },
  { id: 'f4', label: 'Cérémonie de graduation', imageUrl: null, tall: false },
  { id: 'f5', label: 'Cours en présentiel', imageUrl: null, tall: true },
  { id: 'f6', label: 'Chapelle du séminaire', imageUrl: null, tall: false },
];

export function GallerySection() {
  const head = useReveal();
  const grid = useReveal();
  const [images, setImages] = useState<GalleryImageDto[]>(FALLBACK);
  const [active, setActive] = useState<GalleryImageDto | null>(null);

  useEffect(() => {
    contentApi.gallery().then((list) => list.length && setImages(list)).catch(() => {});
  }, []);

  return (
    <section id="galerie" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Galerie</div>
          <h2 className="section-title">La vie du campus, en images.</h2>
        </div>
        <div ref={grid.ref} className={`gallery-grid ${grid.className}`}>
          {images.map((img) => (
            <button
              key={img.id}
              className={`gallery-tile${img.tall ? ' tall' : ''}`}
              style={img.imageUrl ? { backgroundImage: `url(${img.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              onClick={() => setActive(img)}
            >
              <span>{img.label}</span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="modal-overlay show" style={{ zIndex: 1150 }} onClick={() => setActive(null)}>
          <div className="modal-box" style={{ maxWidth: 640, padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 20,
                background: active.imageUrl ? `url(${active.imageUrl}) center/cover` : 'linear-gradient(135deg,var(--royal-deep),var(--royal-2))',
              }}
            >
              {!active.imageUrl && active.label}
            </div>
            <button className="modal-close" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }} onClick={() => setActive(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
