'use client';

import { AuthProvider } from '../../../../../lib/auth-context';
import { RoleGate } from '../../../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../../../components/dashboard/AppTopbar';
import { CourseLearning } from '../../../../../components/dashboard/CourseLearning';

function Content({ courseId }: { courseId: string }) {
  return (
    <div className="admin-shell">
      <RoleGate allow={['STUDENT']} hint="Connectez-vous avec votre compte étudiant.">
        <AppTopbar title="Mon cours" />
        <div className="admin-main" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <a href="/dashboard/student" style={{ fontSize: 13, color: 'var(--text-soft)', display: 'inline-block', marginBottom: 18 }}>
            ← Retour au tableau de bord
          </a>
          <CourseLearning courseId={courseId} />
        </div>
      </RoleGate>
    </div>
  );
}

export default function CoursePage({ params }: { params: { id: string } }) {
  return (
    <AuthProvider>
      <Content courseId={params.id} />
    </AuthProvider>
  );
}
