'use client';

import { DataTable, type Column } from '@/shared/components/admin/DataTable';
import type { Service } from '../types';

export function ServicesTable({ services }: { services: Service[] }) {
  const columns: Column<Service>[] = [
    {
      key: 'date',
      header: 'Service',
      cell: (s) => (
        <div>
          <div className="text-[14px] font-medium text-foreground">{s.title}</div>
          <div className="text-[11px] text-muted-foreground">
            {formatDate(s.date)} · {s.time}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Attendance',
      align: 'right',
      cell: (s) => (
        <span className="font-display text-[16px] text-foreground">
          {s.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'firstTimers',
      header: 'First-time',
      align: 'right',
      className: 'hidden md:table-cell',
      cell: (s) => s.firstTimers,
    },
    {
      key: 'children',
      header: 'Children',
      align: 'right',
      className: 'hidden md:table-cell',
      cell: (s) => s.children,
    },
    {
      key: 'volunteers',
      header: 'Volunteers',
      align: 'right',
      className: 'hidden lg:table-cell',
      cell: (s) =>
        `${s.volunteersFilled} / ${s.volunteersTotal}`,
    },
  ];

  return <DataTable data={services} columns={columns} rowKey={(s) => s.id} />;
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
