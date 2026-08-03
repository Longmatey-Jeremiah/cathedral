import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/shared/lib/types';
import { roleLabels } from '@/mocks/members';

const toneByRole = {
  SUPER_ADMIN: 'warning',
  ADMIN: 'info',
  FINANCE: 'success',
  DEPARTMENT_LEADER: 'neutral',
  MEMBER_CARE: 'info',
  VIEWER: 'neutral',
} as const;

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={toneByRole[role]}>{roleLabels[role]}</Badge>;
}
