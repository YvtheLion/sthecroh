'use client';

import { useEffect, useState } from 'react';
import { AdminResourceTable, FieldDef } from './AdminResourceTable';
import { contentApi } from '../../lib/api';

export function AdminCoursesPanel() {
  const [teacherOptions, setTeacherOptions] = useState<{ value: string; label: string }[]>([]);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    contentApi.teachers().then((list) => setTeacherOptions(list.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }))));
    contentApi.programs().then((list) => setProgramOptions(list.map((p) => ({ value: p.id, label: p.name }))));
  }, []);

  const fields: FieldDef[] = [
    { key: 'title', label: 'Titre', type: 'text', required: true },
    { key: 'slug', label: 'Slug (URL)', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    {
      key: 'status', label: 'Statut', type: 'select', required: true,
      options: [
        { value: 'DRAFT', label: 'Brouillon' },
        { value: 'PUBLISHED', label: 'Publié' },
        { value: 'ARCHIVED', label: 'Archivé' },
      ],
    },
    { key: 'credits', label: 'Crédits', type: 'number' },
    { key: 'priceCents', label: 'Prix (centimes, 0 = gratuit)', type: 'number' },
    { key: 'teacherId', label: 'Enseignant', type: 'select', options: teacherOptions, required: true },
    { key: 'programId', label: 'Programme', type: 'select', options: programOptions },
  ];

  return (
    <AdminResourceTable
      resource="courses"
      title="Cours"
      fields={fields}
      columns={['title', 'status', 'credits']}
      listAll={false}
    />
  );
}
