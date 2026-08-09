'use client';

import { AuthProvider } from '../../../../lib/auth-context';
import { RoleGate } from '../../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../../components/dashboard/AppTopbar';
import { MessagesView } from '../../../../components/dashboard/MessagesView';

function Content() {
  return (
    <div className="admin-shell">
      <RoleGate allow={['TEACHER']} hint="Connectez-vous avec votre compte enseignant.">
        <AppTopbar title="Messagerie" />
        <div className="admin-main" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <a href="/dashboard/teacher" style={{ fontSize: 13, color: 'var(--text-soft)', display: 'inline-block', marginBottom: 18 }}>
            ← Retour au tableau de bord
          </a>
          <MessagesView />
        </div>
      </RoleGate>
    </div>
  );
}

export default function TeacherMessagesPage() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}
