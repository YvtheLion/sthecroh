'use client';

import { AuthProvider, useAuth } from '../../../lib/auth-context';
import { RoleGate } from '../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../components/dashboard/AppTopbar';
import { StudentDashboard } from '../../../components/dashboard/StudentDashboard';

function Content() {
  const { user } = useAuth();
  return (
    <div className="admin-shell">
      <RoleGate allow={['STUDENT']} hint="Connectez-vous avec votre compte étudiant.">
        <AppTopbar title="Espace étudiant" />
        {user && <StudentDashboard firstName={user.firstName} lastName={user.lastName} />}
      </RoleGate>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}
