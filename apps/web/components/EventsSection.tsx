'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '../lib/use-reveal';
import { contentApi, EventItem } from '../lib/api';

const MONTHS = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];

const FALLBACK: EventItem[] = [
  { id: 'f1', title: 'Rentrée académique 2026-2027', place: 'Campus principal, Port-au-Prince', date: '2026-09-14' },
  { id: 'f2', title: 'Conférence — Théologie et modernité', place: 'Auditorium STHECROH · en ligne', date: '2026-10-02' },
  { id: 'f3', title: 'Cérémonie de remise des diplômes', place: 'Campus principal · retransmis en direct', date: '2026-11-21' },
];

export function EventsSection() {
  const head = useReveal();
  const grid = useReveal();
  const [events, setEvents] = useState<EventItem[]>(FALLBACK);

  useEffect(() => {
    contentApi.events().then((list) => list.length && setEvents(list)).catch(() => {});
  }, []);

  return (
    <section id="evenements">
      <div className="container">
        <div ref={head.ref} className={`section-head ${head.className}`}>
          <div className="eyebrow">Événements</div>
          <h2 className="section-title">Les temps forts de la vie du séminaire.</h2>
        </div>
        <div ref={grid.ref} className={`event-grid ${grid.className}`}>
          {events.map((e) => {
            const d = new Date(e.date);
            return (
              <a key={e.id} href={`/evenements/${e.id}`} className="event-card" style={{ cursor: 'pointer' }}>
                <div className="event-date">
                  <b>{String(d.getDate()).padStart(2, '0')}</b>
                  <span>{MONTHS[d.getMonth()]}</span>
                </div>
                <div>
                  <h4>{e.title}</h4>
                  <p>{e.place}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
