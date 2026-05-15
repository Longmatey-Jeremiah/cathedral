'use client';

import { RoleBadge } from '@/features/members/components/RoleBadge';
import { Avatar } from '@/shared/components/admin/Avatar';
import { DataTable, type Column } from '@/shared/components/admin/DataTable';
import { StatusBadge } from '@/shared/components/admin/StatusBadge';
import type { PlatformUser } from '../types';

export function PlatformUsersTable({
  users,
}: {
  users: PlatformUser[];
}) {
  const columns: Column<PlatformUser>[] = [
    {
      key: 'name',
      header: 'User',
      cell: (u) => {
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
        return (
          <div className="flex items-center gap-3">
            <Avatar name={name} />
            <div className="min-w-0">
              <div className="truncate text-[14px] font-medium text-foreground">
                {name}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {u.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      cell: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: 'church',
      header: 'Church',
      className: 'hidden md:table-cell',
      cell: (u) =>
        u.churchName ? (
          <span className="text-foreground">{u.churchName}</span>
        ) : (
          <span className="text-muted-foreground">— platform</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (u) => (
        <StatusBadge dot tone={u.status === 'ACTIVE' ? 'success' : 'warning'}>
          {u.status === 'ACTIVE' ? 'Active' : 'Pending'}
        </StatusBadge>
      ),
    },
    {
      key: 'lastSignIn',
      header: 'Last sign-in',
      align: 'right',
      className: 'hidden lg:table-cell text-[12px] text-muted-foreground',
      cell: (u) => (u.lastSignIn ? formatDate(u.lastSignIn) : '—'),
    },
  ];

  return <DataTable data={users} columns={columns} rowKey={(u) => u.id} />;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
