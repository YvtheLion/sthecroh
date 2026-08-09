'use client';

import { useState } from 'react';
import { AuthProvider } from '../../lib/auth-context';
import { RoleGate } from '../../components/dashboard/RoleGate';
import { AppTopbar } from '../../components/dashboard/AppTopbar';
import { AdminResourceTable, FieldDef } from '../../components/admin/AdminResourceTable';
import { AdminProgramsPanel } from '../../components/admin/AdminProgramsPanel';
import { AdminCoursesPanel } from '../../components/admin/AdminCoursesPanel';
import { AdminUsersPanel } from '../../components/admin/AdminUsersPanel';
import { AdminContactMessagesPanel } from '../../components/admin/AdminContactMessagesPanel';
import { AdminPaymentsPanel } from '../../components/admin/AdminPaymentsPanel';
import { AdminDonationsPanel } from '../../components/admin/AdminDonationsPanel';
import { AdminActivityLogsPanel } from '../../components/admin/AdminActivityLogsPanel';
import { AdminCertificatesPanel } from '../../components/admin/AdminCertificatesPanel';

const TABS = [
  { id: 'testimonials', label: 'Témoignages' },
  { id: 'events', label: 'Événements' },
  { id: 'gallery', label: 'Galerie' },
  { id: 'faq', label: 'FAQ' },
  { id: 'news', label: 'Actualités' },
  { id: 'history', label: 'Historique' },
  { id: 'departments', label: 'Départements' },
  { id: 'programs', label: 'Programmes' },
  { id: 'academic-years', label: 'Années académiques' },
  { id: 'semesters', label: 'Semestres' },
  { id: 'courses', label: 'Cours' },
  { id: 'library', label: 'Bibliothèque' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'certificates', label: 'Certificats & diplômes' },
  { id: 'payments', label: 'Paiements' },
  { id: 'donations', label: 'Dons' },
  { id: 'activity', label: "Journaux d'activité" },
  { id: 'messages', label: 'Messages de contact' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const TESTIMONIAL_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Nom', type: 'text', required: true },
  { key: 'role', label: 'Fonction', type: 'text', required: true },
  { key: 'initials', label: 'Initiales', type: 'text', required: true },
  { key: 'quote', label: 'Citation', type: 'textarea', required: true },
  { key: 'position', label: 'Ordre d’affichage', type: 'number' },
  { key: 'published', label: 'Publié', type: 'checkbox' },
];

const EVENT_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Titre', type: 'text', required: true },
  { key: 'place', label: 'Lieu', type: 'text', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'published', label: 'Publié', type: 'checkbox' },
];

const GALLERY_FIELDS: FieldDef[] = [
  { key: 'label', label: 'Légende', type: 'text', required: true },
  { key: 'imageUrl', label: 'URL de l’image', type: 'text' },
  { key: 'tall', label: 'Grande vignette', type: 'checkbox' },
  { key: 'position', label: 'Ordre d’affichage', type: 'number' },
  { key: 'published', label: 'Publié', type: 'checkbox' },
];

const FAQ_FIELDS: FieldDef[] = [
  { key: 'question', label: 'Question', type: 'text', required: true },
  { key: 'answer', label: 'Réponse', type: 'textarea', required: true },
  { key: 'position', label: 'Ordre d’affichage', type: 'number' },
  { key: 'published', label: 'Publié', type: 'checkbox' },
];

const NEWS_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Titre', type: 'text', required: true },
  { key: 'excerpt', label: 'Extrait', type: 'textarea', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'published', label: 'Publié', type: 'checkbox' },
];

const HISTORY_FIELDS: FieldDef[] = [
  { key: 'year', label: 'Année', type: 'text', required: true },
  { key: 'title', label: 'Titre', type: 'text', required: true },
  { key: 'text', label: 'Texte', type: 'textarea', required: true },
  { key: 'position', label: 'Ordre d’affichage', type: 'number' },
  { key: 'published', label: 'Publié', type: 'checkbox' },
];

const DEPARTMENT_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Nom', type: 'text', required: true },
  { key: 'slug', label: 'Slug (URL)', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const LIBRARY_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Titre', type: 'text', required: true },
  { key: 'author', label: 'Auteur', type: 'text' },
  { key: 'category', label: 'Catégorie', type: 'text' },
  { key: 'fileUrl', label: 'URL du fichier', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const ACADEMIC_YEAR_FIELDS: FieldDef[] = [
  { key: 'label', label: 'Libellé (ex: 2026-2027)', type: 'text', required: true },
  { key: 'startDate', label: 'Date de début', type: 'date', required: true },
  { key: 'endDate', label: 'Date de fin', type: 'date', required: true },
  { key: 'isActive', label: 'Année active', type: 'checkbox' },
];

const SEMESTER_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Nom (ex: Semestre 1)', type: 'text', required: true },
  { key: 'startDate', label: 'Date de début', type: 'date', required: true },
  { key: 'endDate', label: 'Date de fin', type: 'date', required: true },
  { key: 'academicYearId', label: "Identifiant de l'année académique", type: 'text', required: true },
];

function AdminContent() {
  const [tab, setTab] = useState<TabId>('testimonials');

  return (
    <RoleGate allow={['ADMIN', 'SUPER_ADMIN']} hint="Connectez-vous avec un compte ADMIN ou SUPER_ADMIN.">
      <AppTopbar title="Administration" />
      <div className="admin-layout">
        <div className="admin-sidebar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`admin-nav-item${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="admin-main">
          {tab === 'testimonials' && (
            <AdminResourceTable resource="testimonials" title="Témoignages" fields={TESTIMONIAL_FIELDS} columns={['name', 'role', 'published']} />
          )}
          {tab === 'events' && (
            <AdminResourceTable resource="events" title="Événements" fields={EVENT_FIELDS} columns={['title', 'place', 'date', 'published']} />
          )}
          {tab === 'gallery' && (
            <AdminResourceTable resource="gallery" title="Galerie" fields={GALLERY_FIELDS} columns={['label', 'tall', 'published']} />
          )}
          {tab === 'faq' && (
            <AdminResourceTable resource="faq" title="FAQ" fields={FAQ_FIELDS} columns={['question', 'published']} />
          )}
          {tab === 'news' && (
            <AdminResourceTable resource="news" title="Actualités" fields={NEWS_FIELDS} columns={['title', 'date', 'published']} />
          )}
          {tab === 'history' && (
            <AdminResourceTable resource="history" title="Historique" fields={HISTORY_FIELDS} columns={['year', 'title', 'published']} />
          )}
          {tab === 'departments' && (
            <AdminResourceTable resource="departments" title="Départements" fields={DEPARTMENT_FIELDS} columns={['name', 'slug']} listAll={false} />
          )}
          {tab === 'programs' && <AdminProgramsPanel />}
          {tab === 'academic-years' && (
            <AdminResourceTable resource="academic-years" title="Années académiques" fields={ACADEMIC_YEAR_FIELDS} columns={['label', 'isActive']} listAll={false} />
          )}
          {tab === 'semesters' && (
            <AdminResourceTable resource="semesters" title="Semestres" fields={SEMESTER_FIELDS} columns={['name', 'startDate', 'endDate']} listAll={false} />
          )}
          {tab === 'courses' && <AdminCoursesPanel />}
          {tab === 'library' && (
            <AdminResourceTable resource="library" title="Bibliothèque" fields={LIBRARY_FIELDS} columns={['title', 'author', 'category']} listAll={false} />
          )}
          {tab === 'users' && <AdminUsersPanel />}
          {tab === 'certificates' && <AdminCertificatesPanel />}
          {tab === 'payments' && <AdminPaymentsPanel />}
          {tab === 'donations' && <AdminDonationsPanel />}
          {tab === 'activity' && <AdminActivityLogsPanel />}
          {tab === 'messages' && <AdminContactMessagesPanel />}
        </div>
      </div>
    </RoleGate>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <div className="admin-shell">
        <AdminContent />
      </div>
    </AuthProvider>
  );
}
