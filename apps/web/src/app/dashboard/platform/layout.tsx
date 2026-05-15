import type { ReactNode } from 'react';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { UserRole } from '@/shared/lib/types';

/** Every /dashboard/platform/* route is SUPER_ADMIN-only. */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth roles={[UserRole.SUPER_ADMIN]}>{children}</RequireAuth>
  );
}
