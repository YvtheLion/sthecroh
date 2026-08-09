'use client';

import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../lib/use-reveal';

type Tab = 'etudiant' | 'enseignant' | 'admin';

const STUDENT_DATA = [
  { label: 'Lun', h: 40 },
  { label: 'Mar', h: 65 },
  { label: 'Mer', h: 50 },
  { label: 'Jeu', h: 80 },
  { label: 'Ven', h: 60 },
  { label: 'Sam', h: 30 },
  { label: 'Dim', h: 20 },
];
const TEACHER_DATA = [
  { label: 'Ex1', h: 88 },
  { label: 'Ex2', h: 74 },
  { label: 'Ex3', h: 91 },
  { label: 'Ex4', h: 66 },
  { label: 'Ex5', h: 83 },
  { label: 'Ex6', h: 95 },
];

function BarChart({ data }: { data: { label: string; h: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          el.innerHTML = '';
          data.forEach((v) => {
            const col = document.createElement('div');
            col.className = 'col';
            const fill = document.createElement('div');
            fill.className = 'fill';
            fill.style.height = '0%';
            col.appendChild(fill);
            const span = document.createElement('span');
            span.textContent = v.label;
            col.appendChild(span);
            el.appendChild(col);
            requestAnimationFrame(() => setTimeout(() => (fill.style.height = v.h + '%'), 60));
          });
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  return <div className="bar-chart" ref={ref} />;
}

function Kpi({ label, value, delta, down }: { label: string; value: string; delta: string; down?: boolean }) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className={`delta${down ? ' down' : ''}`}>{delta}</div>}
    </div>
  );
}

function Row({ label, tag, ok }: { label: string; tag: string; ok?: boolean }) {
  return (
    <div className="row">
      <span>{label}</span>
      <span className={`pill ${ok ? 'ok' : 'warn'}`}>{tag}</span>
    </div>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </>
  ),
  chart: <path d="M4 20V10M12 20V4M20 20v-6" />,
  cert: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="m8.5 12.5-1 8 4.5-2.5 4.5 2.5-1-8" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 1 1-3.4-6.5L21 4l-1 4.5A7.96 7.96 0 0 1 21 12Z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
};

function SideLink({ label, icon, active }: { label: string; icon: string; active?: boolean }) {
  return (
    <a href="#" className={active ? 'active' : ''} onClick={(e) => e.preventDefault()}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {ICONS[icon]}
      </svg>
      <span className="label">{label}</span>
    </a>
  );
}

/**
 * Aperçu de démonstration (page d'accueil publique) — données fictives et volontairement figées.
 * Les VRAIS tableaux de bord, connectés à l'API et propres à chaque utilisateur, vivent désormais
 * sur leurs propres pages : /dashboard/student, /dashboard/teacher et /admin.
 */
export function PlatformPreview() {
  const [tab, setTab] = useState<Tab>('etudiant');
  const head = useReveal();
  const tabsReveal = useReveal();
  const student = useReveal();
  const teacher = useReveal();
  const admin = useReveal();

  return (
    <section id="plateforme" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div ref={head.ref} className={`section-head center ${head.className}`}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Aperçu plateforme</div>
          <h2 className="section-title">Trois espaces, une seule expérience.</h2>
          <p className="section-lede">
            Étudiants, enseignants et administrateurs disposent chacun d&rsquo;un espace dédié, avec sa
            propre page et ses propres données.
          </p>
        </div>

        <div ref={tabsReveal.ref} className={`tabs-switch ${tabsReveal.className}`}>
          <button className={`tab-btn${tab === 'etudiant' ? ' active' : ''}`} onClick={() => setTab('etudiant')}>
            Espace étudiant
          </button>
          <button className={`tab-btn${tab === 'enseignant' ? ' active' : ''}`} onClick={() => setTab('enseignant')}>
            Espace enseignant
          </button>
          <button className={`tab-btn${tab === 'admin' ? ' active' : ''}`} onClick={() => setTab('admin')}>
            Administration
          </button>
        </div>

        <div ref={student.ref} className={`dash-frame ${tab === 'etudiant' ? 'active' : ''} ${student.className}`}>
          <div className="dash-topbar">
            <div className="who">
              <span className="avatar">EM</span> Emmanuel Mbeki
            </div>
            <input className="dash-search" placeholder="Rechercher un cours…" readOnly />
          </div>
          <div className="dash-body">
            <div className="dash-side">
              <SideLink active label="Tableau de bord" icon="home" />
              <SideLink label="Mes cours" icon="book" />
              <SideLink label="Progression" icon="chart" />
              <SideLink label="Certificats" icon="cert" />
              <SideLink label="Messagerie" icon="chat" />
              <SideLink label="Paramètres" icon="settings" />
            </div>
            <div className="dash-main">
              <div className="dash-welcome">Bonjour, Emmanuel 👋</div>
              <div className="dash-sub">Voici un résumé de sa progression cette semaine.</div>
              <div className="kpi-row">
                <Kpi label="Cours en cours" value="4" delta="+1 ce mois" />
                <Kpi label="Progression moyenne" value="72%" delta="+6%" />
                <Kpi label="Devoirs à rendre" value="2" delta="-1" down />
                <Kpi label="Certificats obtenus" value="3" delta="+1" />
              </div>
              <div className="panels-row">
                <div className="panel">
                  <h5>
                    Heures d&rsquo;étude hebdomadaires <span className="tag">Cette semaine</span>
                  </h5>
                  <BarChart data={STUDENT_DATA} />
                </div>
                <div className="panel">
                  <h5>Prochaines échéances</h5>
                  <div className="list-simple">
                    <Row label="Herméneutique — Devoir 3" tag="3 jours" />
                    <Row label="Grec biblique — Quiz" tag="5 jours" />
                    <Row label="Histoire de l'Église — Lu" tag="Terminé" ok />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={teacher.ref} className={`dash-frame ${tab === 'enseignant' ? 'active' : ''} ${teacher.className}`}>
          <div className="dash-topbar">
            <div className="who">
              <span className="avatar">SD</span> Dr. Samuel Diarra
            </div>
            <input className="dash-search" placeholder="Rechercher un étudiant…" readOnly />
          </div>
          <div className="dash-body">
            <div className="dash-side">
              <SideLink active label="Tableau de bord" icon="home" />
              <SideLink label="Mes classes" icon="book" />
              <SideLink label="Devoirs à corriger" icon="cert" />
              <SideLink label="Étudiants" icon="users" />
              <SideLink label="Statistiques" icon="chart" />
              <SideLink label="Paramètres" icon="settings" />
            </div>
            <div className="dash-main">
              <div className="dash-welcome">Bienvenue, Dr. Diarra 👋</div>
              <div className="dash-sub">6 classes actives — 128 étudiants inscrits.</div>
              <div className="kpi-row">
                <Kpi label="Classes actives" value="6" delta="+2" />
                <Kpi label="Étudiants" value="128" delta="+14" />
                <Kpi label="Devoirs à corriger" value="14" delta="-3" down />
                <Kpi label="Taux de réussite" value="91%" delta="+2%" />
              </div>
              <div className="panels-row">
                <div className="panel">
                  <h5>
                    Résultats moyens par classe <span className="tag">Semestre en cours</span>
                  </h5>
                  <BarChart data={TEACHER_DATA} />
                </div>
                <div className="panel">
                  <h5>Copies en attente</h5>
                  <div className="list-simple">
                    <Row label="Théologie Systématique — 12 copies" tag="À corriger" />
                    <Row label="Grec Biblique — 6 copies" tag="À corriger" />
                    <Row label="Herméneutique — 9 copies" tag="Corrigées" ok />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={admin.ref} className={`dash-frame ${tab === 'admin' ? 'active' : ''} ${admin.className}`}>
          <div className="dash-topbar">
            <div className="who">
              <span className="avatar">AD</span> Administration STHECROH
            </div>
            <input className="dash-search" placeholder="Rechercher…" readOnly />
          </div>
          <div className="dash-body">
            <div className="dash-side">
              <SideLink active label="Vue d'ensemble" icon="home" />
              <SideLink label="Étudiants" icon="users" />
              <SideLink label="Enseignants" icon="book" />
              <SideLink label="Finances" icon="chart" />
              <SideLink label="Certificats émis" icon="cert" />
              <SideLink label="Paramètres système" icon="settings" />
            </div>
            <div className="dash-main">
              <div className="dash-welcome">Vue d&rsquo;ensemble de la plateforme</div>
              <div className="dash-sub">Données consolidées — mise à jour il y a 4 minutes.</div>
              <div className="kpi-row">
                <Kpi label="Étudiants inscrits" value="3 482" delta="+128" />
                <Kpi label="Enseignants" value="96" delta="+4" />
                <Kpi label="Revenus (mois)" value="18 240 $" delta="+9%" />
                <Kpi label="Certificats émis" value="947" delta="+31" />
              </div>
              <div className="panels-row">
                <div className="panel">
                  <h5>
                    Revenus mensuels <span className="tag">12 derniers mois</span>
                  </h5>
                  <div className="line-wrap">
                    <svg viewBox="0 0 320 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--royal-2)" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="var(--royal-2)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,90 L30,80 L60,85 L90,60 L120,68 L150,45 L180,55 L210,30 L240,38 L270,20 L300,26 L320,10 L320,120 L0,120 Z"
                        fill="url(#lineFill)"
                      />
                      <path
                        d="M0,90 L30,80 L60,85 L90,60 L120,68 L150,45 L180,55 L210,30 L240,38 L270,20 L300,26 L320,10"
                        fill="none"
                        stroke="var(--royal-2)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="panel">
                  <h5>Répartition des programmes</h5>
                  <div className="donut-row">
                    <svg width="96" height="96" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--gray-200)" strokeWidth="4" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none" stroke="var(--royal-2)" strokeWidth="4"
                        strokeDasharray="46 100" strokeDashoffset="0" transform="rotate(-90 18 18)"
                      />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none" stroke="var(--gold)" strokeWidth="4"
                        strokeDasharray="30 100" strokeDashoffset="-46" transform="rotate(-90 18 18)"
                      />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none" stroke="var(--gray-400)" strokeWidth="4"
                        strokeDasharray="24 100" strokeDashoffset="-76" transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className="legend">
                      <span>
                        <i className="dot" style={{ background: 'var(--royal-2)' }} />Théologie — 46%
                      </span>
                      <span>
                        <i className="dot" style={{ background: 'var(--gold)' }} />Ministère — 30%
                      </span>
                      <span>
                        <i className="dot" style={{ background: 'var(--gray-400)' }} />Langues bibliques — 24%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="/dashboard" className="btn btn-primary">
            Accéder à mon espace →
          </a>
        </div>
      </div>
    </section>
  );
}
