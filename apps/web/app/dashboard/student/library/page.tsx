'use client';

import { AuthProvider } from '../../../../lib/auth-context';
import { RoleGate } from '../../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../../components/dashboard/AppTopbar';
import { LibraryView } from '../../../../components/dashboard/LibraryView';

function Content() {
  return (
    <div className="admin-shell">
      <RoleGate allow={['STUDENT', 'TEACHER']} hint="Connectez-vous pour accéder à la bibliothèque.">
        <AppTopbar title="Bibliothèque" />
        <div className="admin-main" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <a href="/dashboard" style={{ fontSize: 13, color: 'var(--text-soft)', display: 'inline-block', marginBottom: 18 }}>
            ← Retour au tableau de bord
          </a>
          <LibraryView />
        </div>
      </RoleGate>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}
