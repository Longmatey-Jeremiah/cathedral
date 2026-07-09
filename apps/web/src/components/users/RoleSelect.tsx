'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateUserRole } from '@/hooks/users';
import { UserRole } from '@/shared/lib/types';
import { roleLabels } from '@/mocks/members';

// SUPER_ADMIN is intentionally not assignable here — a church admin must not be
// able to escalate an account to platform operator. The API enforces this too.
const ASSIGNABLE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.DEPARTMENT_LEADER,
  UserRole.VIEWER,
];

export function RoleSelect({
  userId,
  role: initial,
  onUpdated,
}: {
  userId: string;
  role: UserRole;
  /** Called after a successful save so lists can invalidate/refetch. */
  onUpdated?: () => void;
}) {
  const [role, setRole] = useState<UserRole>(initial);
  const mutation = useUpdateUserRole(userId, {
    onError: (err) => {
      setRole(initial); // revert optimistic change
      toast.error(err.message);
    },
    onSuccess: (updated) => {
      toast.success(`Role updated to ${roleLabels[updated.role]}`);
      onUpdated?.();
    },
  });

  // SUPER_ADMIN accounts are not editable from a role picker.
  if (initial === UserRole.SUPER_ADMIN) {
    return <span className="text-[13px] text-foreground">{roleLabels[initial]}</span>;
  }

  return (
    <Select
      value={role}
      disabled={mutation.isPending}
      onValueChange={(next: UserRole) => {
        setRole(next); // optimistic
        mutation.mutate(next);
      }}
    >
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNABLE_ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {roleLabels[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
