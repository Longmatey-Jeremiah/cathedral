'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { Sidebar } from '@/features/dashboard/components/Sidebar';
import { Topbar } from '@/features/dashboard/components/Topbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Shell>{children}</Shell>
    </RequireAuth>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // RequireAuth gates this — by the time Shell renders, `user` is non-null.
  if (!user) return null;

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <div className="flex min-h-screen bg-page-canvas">
      <Sidebar role={user.role} userLabel={fullName} email={user.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={fullName} email={user.email} role={user.role} />
        <main className="flex-1 px-6 pb-12 pt-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
