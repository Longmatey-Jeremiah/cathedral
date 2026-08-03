'use client';

import { memo } from 'react';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { Avatar } from '@/components/admin/Avatar';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge, type BadgeTone } from '@/components/admin/StatusBadge';
import type { ExportColumn } from '@/shared/lib/export';
import type { MemberListItem, MemberStatus } from '@/types/members';

const STATUS: Record<MemberStatus, { tone: BadgeTone; label: string }> = {
  ACTIVE: { tone: 'success', label: 'Active' },
  INACTIVE: { tone: 'neutral', label: 'Inactive' },
  VISITOR: { tone: 'warning', label: 'Visitor' },
};

export const memberExportColumns: ExportColumn<MemberListItem>[] = [
  { header: 'Name', value: (m) => m.name },
  { header: 'Phone', value: (m) => m.phone },
  { header: 'Status', value: (m) => STATUS[m.status].label },
  { header: 'Departments', value: (m) => m.departmentCount },
];

function MembersTableBase({ members }: { members: MemberListItem[] }) {
  const columns: Column<MemberListItem>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (m) => (
        <Link
          href={`/dashboard/members/${m.id}`}
          className="flex items-center gap-3"
        >
          <Avatar name={m.name} />
          <span className="truncate text-[14px] font-medium text-foreground">
            {m.name}
          </span>
        </Link>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      className: 'hidden md:table-cell text-foreground',
      cell: (m) => m.phone ?? '—',
    },
    {
      key: 'departments',
      header: 'Departments',
      className: 'hidden lg:table-cell text-foreground',
      cell: (m) => m.departmentCount,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (m) => (
        <StatusBadge dot tone={STATUS[m.status].tone}>
          {STATUS[m.status].label}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Open</span>,
      align: 'right',
      cell: (m) => (
        <Link
          href={`/dashboard/members/${m.id}`}
          aria-label={`Open ${m.name}`}
          className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiArrowUpRight size={14} />
        </Link>
      ),
    },
  ];

  return <DataTable data={members} columns={columns} rowKey={(m) => m.id} />;
}

// Rows are pure in their `members` prop — memo skips re-render on unrelated
// parent state (search box keystrokes, etc.).
export const MembersTable = memo(MembersTableBase);
