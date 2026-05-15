import type { ReactNode } from 'react';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { UserRole } from '@/shared/lib/types';

/**
 * Sub-layout that gates every /dashboard/churches/* route to SUPER_ADMIN.
 * Anyone else gets bounced back to /dashboard by `RequireAuth`.
 */
export default function ChurchesLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth roles={[UserRole.SUPER_ADMIN]}>{children}</RequireAuth>
  );
}
