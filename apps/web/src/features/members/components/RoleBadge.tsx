import { Badge } from '@/shared/components/ui/badge';
import { UserRole } from '@/shared/lib/types';
import { roleLabels } from '../mock-data';

const toneByRole = {
  SUPER_ADMIN: 'warning',
  ADMIN: 'info',
  FINANCE: 'success',
  DEPARTMENT_LEADER: 'neutral',
  VIEWER: 'neutral',
} as const;

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={toneByRole[role]}>{roleLabels[role]}</Badge>;
}
