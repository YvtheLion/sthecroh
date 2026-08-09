'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../lib/auth-context';

function DashboardRouterInner() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (user.role === 'STUDENT') router.replace('/dashboard/student');
    else if (user.role === 'TEACHER') router.replace('/dashboard/teacher');
    else router.replace('/admin');
  }, [user, loading, router]);

  return (
    <div className="admin-guard">
      <p style={{ color: 'var(--text-soft)' }}>Redirection vers votre espace…</p>
    </div>
  );
}

export default function DashboardRouterPage() {
  return (
    <AuthProvider>
      <div className="admin-shell">
        <DashboardRouterInner />
      </div>
    </AuthProvider>
  );
}
