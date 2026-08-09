'use client';

import { AuthProvider } from '../../../../lib/auth-context';
import { RoleGate } from '../../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../../components/dashboard/AppTopbar';
import { GradesView } from '../../../../components/dashboard/GradesView';

function Content() {
  return (
    <div className="admin-shell">
      <RoleGate allow={['STUDENT']} hint="Connectez-vous avec votre compte étudiant.">
        <AppTopbar title="Mes notes" />
        <div className="admin-main" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <a href="/dashboard/student" style={{ fontSize: 13, color: 'var(--text-soft)', display: 'inline-block', marginBottom: 18 }}>
            ← Retour au tableau de bord
          </a>
          <GradesView />
        </div>
      </RoleGate>
    </div>
  );
}

export default function GradesPage() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}
