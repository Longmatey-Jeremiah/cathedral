'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/auth-context';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Shell>{children}</Shell>
    </RequireAuth>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  // RequireAuth gates this — by the time Shell renders, `user` is non-null.
  if (!user) return null;

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <div className="flex min-h-screen bg-page-canvas">
      <Sidebar
        role={user.role}
        userLabel={fullName}
        email={user.email}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          name={fullName}
          email={user.email}
          role={user.role}
          onMenuClick={() => setMenuOpen(true)}
        />
        <main className="flex-1 px-6 pb-12 pt-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
