'use client';

import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { Avatar } from '@/shared/components/admin/Avatar';
import { DataTable, type Column } from '@/shared/components/admin/DataTable';
import { StatusBadge } from '@/shared/components/admin/StatusBadge';
import type { Member } from '../types';
import { RoleBadge } from './RoleBadge';

export function MembersTable({ members }: { members: Member[] }) {
  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (m) => (
        <Link
          href={`/dashboard/members/${m.id}`}
          className="flex items-center gap-3"
        >
          <Avatar name={`${m.firstName} ${m.lastName}`} />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-foreground">
              {m.firstName} {m.lastName}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {m.email}
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (m) => <RoleBadge role={m.role} />,
    },
    {
      key: 'department',
      header: 'Department',
      className: 'hidden md:table-cell text-foreground',
      cell: (m) => m.department ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (m) => (
        <StatusBadge
          dot
          tone={m.status === 'ACTIVE' ? 'success' : 'warning'}
        >
          {m.status === 'ACTIVE' ? 'Active' : 'Pending'}
        </StatusBadge>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      className: 'hidden lg:table-cell text-[12px] text-muted-foreground',
      cell: (m) => formatDate(m.joinedAt),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Open</span>,
      align: 'right',
      cell: (m) => (
        <Link
          href={`/dashboard/members/${m.id}`}
          aria-label={`Open ${m.firstName}`}
          className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiArrowUpRight size={14} />
        </Link>
      ),
    },
  ];

  return <DataTable data={members} columns={columns} rowKey={(m) => m.id} />;
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
