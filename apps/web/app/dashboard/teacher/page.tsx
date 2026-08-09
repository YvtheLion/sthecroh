'use client';

import { AuthProvider, useAuth } from '../../../lib/auth-context';
import { RoleGate } from '../../../components/dashboard/RoleGate';
import { AppTopbar } from '../../../components/dashboard/AppTopbar';
import { TeacherDashboard } from '../../../components/dashboard/TeacherDashboard';

function Content() {
  const { user } = useAuth();
  return (
    <div className="admin-shell">
      <RoleGate allow={['TEACHER']} hint="Connectez-vous avec votre compte enseignant.">
        <AppTopbar title="Espace enseignant" />
        {user && <TeacherDashboard firstName={user.firstName} />}
      </RoleGate>
    </div>
  );
}

export default function TeacherDashboardPage() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
}
