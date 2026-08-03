'use client';

import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import { useDepartments } from '@/hooks/departments';
import { useUpdateMember } from '@/hooks/members';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/shared/lib/cn';
import type { DepartmentRole, MemberDepartment } from '@/types/members';

const ROLE_LABELS: Record<DepartmentRole, string> = {
  MEMBER: 'Member',
  LEADER: 'Leader',
};

const ROLES: DepartmentRole[] = ['MEMBER', 'LEADER'];

interface Props {
  memberId: string;
  memberName: string;
  assignments: MemberDepartment[];
  /** Only admins may reassign — the API enforces the same on PATCH /members/:id. */
  canManage: boolean;
}

/**
 * Departments a member serves in, and their role in each.
 *
 * Every change PATCHes the whole assignment list, because that is what the API
 * takes — it replaces the set rather than patching one row.
 */
export function MemberDepartments({
  memberId,
  memberName,
  assignments,
  canManage,
}: Props) {
  // ponytail: one page of departments (cap 100). Swap for a search combobox if
  // a church ever runs more than that.
  const { data: departmentPage } = useDepartments({ page: 1, pageSize: 100 });
  const [addingId, setAddingId] = useState('');
  const [addingRole, setAddingRole] = useState<DepartmentRole>('MEMBER');

  const update = useUpdateMember(memberId, {
    onError: (err) => toast.error(err.message),
  });

  const departments = departmentPage?.data ?? [];
  const unassigned = departments.filter(
    (d) => !assignments.some((a) => a.departmentId === d.id),
  );

  function save(next: MemberDepartment[], message: string) {
    update.mutate(
      {
        departments: next.map((a) => ({
          departmentId: a.departmentId,
          role: a.role,
        })),
      },
      { onSuccess: () => toast.success(message) },
    );
  }

  function setRole(departmentId: string, role: DepartmentRole) {
    const next = assignments.map((a) =>
      a.departmentId === departmentId ? { ...a, role } : a,
    );
    const name = assignments.find((a) => a.departmentId === departmentId)?.name;
    save(next, `${memberName} is now ${ROLE_LABELS[role].toLowerCase()} of ${name}`);
  }

  function remove(departmentId: string) {
    const removed = assignments.find((a) => a.departmentId === departmentId);
    save(
      assignments.filter((a) => a.departmentId !== departmentId),
      `Removed from ${removed?.name}`,
    );
  }

  function add() {
    const department = departments.find((d) => d.id === addingId);
    if (!department) return;
    save(
      [
        ...assignments,
        {
          departmentId: department.id,
          name: department.name,
          role: addingRole,
        },
      ],
      `Added to ${department.name}`,
    );
    setAddingId('');
    setAddingRole('MEMBER');
  }

  return (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Not serving in any department yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {assignments.map((a) => (
            <li
              key={a.departmentId}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
            >
              <span className="text-[14px] text-foreground">{a.name}</span>
              {canManage ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={a.role}
                    disabled={update.isPending}
                    onValueChange={(role: DepartmentRole) =>
                      setRole(a.departmentId, role)
                    }
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    aria-label={`Remove from ${a.name}`}
                    disabled={update.isPending}
                    onClick={() => remove(a.departmentId)}
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors',
                      'hover:bg-destructive/10 hover:text-destructive disabled:opacity-40',
                    )}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <span className="text-[13px] text-muted-foreground">
                  {ROLE_LABELS[a.role]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Select
            value={addingId}
            disabled={update.isPending || unassigned.length === 0}
            onValueChange={setAddingId}
          >
            <SelectTrigger className="h-9 w-[220px]">
              <SelectValue
                placeholder={
                  unassigned.length === 0
                    ? 'In every department'
                    : 'Add to a department'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {unassigned.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={addingRole}
            disabled={update.isPending}
            onValueChange={(role: DepartmentRole) => setAddingRole(role)}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!addingId || update.isPending}
            onClick={add}
          >
            <FiPlus size={14} aria-hidden />
            {update.isPending ? 'Saving…' : 'Assign'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
