'use client';

import { Avatar } from '@/components/admin/Avatar';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { RoleSelect } from '@/components/users/RoleSelect';
import type { User } from '@/shared/lib/types';

export function TeamTable({ users }: { users: User[] }) {
  const columns: Column<User>[] = [
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
      cell: (u) => <RoleSelect userId={u.id} role={u.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      cell: (u) => (
        <StatusBadge dot tone={u.status === 'ACTIVE' ? 'success' : 'warning'}>
          {u.status === 'ACTIVE' ? 'Active' : 'Pending'}
        </StatusBadge>
      ),
    },
  ];

  return <DataTable data={users} columns={columns} rowKey={(u) => u.id} />;
}
