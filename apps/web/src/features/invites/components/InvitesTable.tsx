'use client';

import { RoleBadge } from '@/features/members/components/RoleBadge';
import { DataTable, type Column } from '@/shared/components/admin/DataTable';
import { StatusBadge } from '@/shared/components/admin/StatusBadge';
import { inviteStatus } from '../mock-data';
import type { Invite } from '../types';

const toneByStatus = {
  pending: 'warning',
  used: 'success',
  expired: 'danger',
} as const;

const labelByStatus = {
  pending: 'Pending',
  used: 'Accepted',
  expired: 'Expired',
} as const;

export function InvitesTable({ invites }: { invites: Invite[] }) {
  const columns: Column<Invite>[] = [
    {
      key: 'email',
      header: 'Email',
      cell: (i) => (
        <span className="font-medium text-foreground">{i.email}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (i) => <RoleBadge role={i.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (i) => {
        const s = inviteStatus(i);
        return (
          <StatusBadge tone={toneByStatus[s]} dot>
            {labelByStatus[s]}
          </StatusBadge>
        );
      },
    },
    {
      key: 'expires',
      header: 'Expires',
      className: 'hidden md:table-cell',
      cell: (i) => formatDate(i.expiresAt),
    },
    {
      key: 'created',
      header: 'Sent',
      className: 'hidden lg:table-cell text-[12px] text-muted-foreground',
      cell: (i) => formatDate(i.createdAt),
    },
  ];

  return <DataTable data={invites} columns={columns} rowKey={(i) => i.id} />;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
