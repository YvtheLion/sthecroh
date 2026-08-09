'use client';

import { AuthProvider } from '../../../../../lib/auth-context';
import { RoleGate } from '../../../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../../../components/dashboard/AppTopbar';
import { TeacherCourseEditor } from '../../../../../components/dashboard/TeacherCourseEditor';

function Content({ courseId }: { courseId: string }) {
  return (
    <div className="admin-shell">
      <RoleGate allow={['TEACHER']} hint="Connectez-vous avec votre compte enseignant.">
        <AppTopbar title="Gestion du cours" />
        <div className="admin-main" style={{ maxWidth: 900, margin: '0 auto' }}>
          <a href="/dashboard/teacher/courses" style={{ fontSize: 13, color: 'var(--text-soft)', display: 'inline-block', marginBottom: 18 }}>
            ← Retour à mes cours
          </a>
          <TeacherCourseEditor courseId={courseId} />
        </div>
      </RoleGate>
    </div>
  );
}

export default function TeacherCourseEditPage({ params }: { params: { id: string } }) {
  return (
    <AuthProvider>
      <Content courseId={params.id} />
    </AuthProvider>
  );
}
