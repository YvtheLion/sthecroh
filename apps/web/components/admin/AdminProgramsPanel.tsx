'use client';

import { useEffect, useState } from 'react';
import { AdminResourceTable, FieldDef } from './AdminResourceTable';
import { contentApi } from '../../lib/api';

export function AdminProgramsPanel() {
  const [departmentOptions, setDepartmentOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    contentApi.departments().then((list) => setDepartmentOptions(list.map((d) => ({ value: d.id, label: d.name }))));
  }, []);

  const fields: FieldDef[] = [
    { key: 'name', label: 'Nom du programme', type: 'text', required: true },
    { key: 'slug', label: 'Slug (URL)', type: 'text', required: true },
    { key: 'degreeLevel', label: 'Niveau', type: 'text', required: true },
    { key: 'durationYears', label: 'Durée (années)', type: 'number', required: true },
    { key: 'departmentId', label: 'Département', type: 'select', options: departmentOptions, required: true },
    { key: 'description', label: 'Description complète (page dédiée)', type: 'textarea' },
  ];

  return <AdminResourceTable resource="programs" title="Programmes" fields={fields} columns={['name', 'degreeLevel', 'durationYears']} />;
}
