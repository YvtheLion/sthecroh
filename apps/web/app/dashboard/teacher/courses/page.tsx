'use client';

import { AuthProvider } from '../../../../lib/auth-context';
import { RoleGate } from '../../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../../components/dashboard/AppTopbar';
import { TeacherCoursesList } from '../../../../components/dashboard/TeacherCoursesList';

function Content() {
  return (
    <div className="admin-shell">
      <RoleGate allow={['TEACHER']} hint="Connectez-vous avec votre compte enseignant.">
        <AppTopbar title="Mes cours" />
        <div className="admin-main" style={{ maxWidth: 900, margin: '0 auto' }}>
          <a href="/dashboard/teacher" style={{ fontSize: 13, color: 'var(--text-soft)', display: 'inline-block', marginBottom: 18 }}>
            ← Retour au tableau de bord
          </a>
          <TeacherCoursesList />
        </div>
      </RoleGate>
    </div>
  );
}

export default function TeacherCoursesPage() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}
