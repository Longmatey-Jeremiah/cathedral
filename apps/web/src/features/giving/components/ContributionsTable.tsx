'use client';

import { DataTable, type Column } from '@/shared/components/admin/DataTable';
import { StatusBadge } from '@/shared/components/admin/StatusBadge';
import { formatMoney, methodLabel } from '../mock-data';
import type { Contribution } from '../types';

export function ContributionsTable({
  contributions,
}: {
  contributions: Contribution[];
}) {
  const columns: Column<Contribution>[] = [
    {
      key: 'date',
      header: 'Date',
      cell: (c) => (
        <span className="text-[12px] text-muted-foreground">
          {formatDate(c.date)}
        </span>
      ),
    },
    {
      key: 'donor',
      header: 'Donor',
      cell: (c) => (
        <span className="text-[14px] font-medium text-foreground">
          {c.donor}
        </span>
      ),
    },
    {
      key: 'fund',
      header: 'Fund',
      cell: (c) => c.fund,
    },
    {
      key: 'method',
      header: 'Method',
      className: 'hidden md:table-cell',
      cell: (c) => (
        <span className="text-muted-foreground">{methodLabel[c.method]}</span>
      ),
    },
    {
      key: 'recurring',
      header: 'Type',
      className: 'hidden lg:table-cell',
      cell: (c) =>
        c.recurring ? (
          <StatusBadge tone="success">Recurring</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">One-off</StatusBadge>
        ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (c) => (
        <span className="font-display text-[15px] text-foreground">
          {formatMoney(c.amount)}
        </span>
      ),
    },
  ];

  return (
    <DataTable data={contributions} columns={columns} rowKey={(c) => c.id} />
  );
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
