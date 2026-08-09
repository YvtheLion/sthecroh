'use client';

import { AuthProvider } from '../../../../../lib/auth-context';
import { RoleGate } from '../../../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../../../components/dashboard/AppTopbar';
import { ExamTaking } from '../../../../../components/dashboard/ExamTaking';

function Content({ examId }: { examId: string }) {
  return (
    <div className="admin-shell">
      <RoleGate allow={['STUDENT']} hint="Connectez-vous avec votre compte étudiant.">
        <AppTopbar title="Examen" />
        <div className="admin-main" style={{ maxWidth: 800, margin: '0 auto' }}>
          <a href="/dashboard/student" style={{ fontSize: 13, color: 'var(--text-soft)', display: 'inline-block', marginBottom: 18 }}>
            ← Retour au tableau de bord
          </a>
          <ExamTaking examId={examId} />
        </div>
      </RoleGate>
    </div>
  );
}

export default function ExamPage({ params }: { params: { id: string } }) {
  return (
    <AuthProvider>
      <Content examId={params.id} />
    </AuthProvider>
  );
}
