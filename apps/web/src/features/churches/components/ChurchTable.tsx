'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowUpRight, FiTrash2 } from 'react-icons/fi';
import { Avatar } from '@/shared/components/admin/Avatar';
import { ConfirmInline } from '@/shared/components/admin/ConfirmInline';
import { DataTable, type Column } from '@/shared/components/admin/DataTable';
import { cn } from '@/shared/lib/cn';
import { useDeleteChurch } from '../hooks';
import type { Church } from '../types';
import { ChurchStatusBadge } from './ChurchStatusBadge';

interface Props {
  churches: Church[];
}

export function ChurchTable({ churches }: Props) {
  const columns: Column<Church>[] = [
    {
      key: 'name',
      header: 'Church',
      cell: (church) => (
        <Link
          href={`/dashboard/churches/${church.id}`}
          className="flex items-center gap-3"
        >
          <Avatar name={church.name} />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-foreground">
              {church.name}
            </div>
            {church.address ? (
              <div className="truncate text-[11px] text-muted-foreground">
                {church.address}
              </div>
            ) : null}
          </div>
        </Link>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      cell: (church) => (
        <code className="rounded-[6px] bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
          {church.slug}
        </code>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      className: 'hidden md:table-cell',
      cell: (church) => (
        <div>
          <div className="text-[12px] text-foreground">{church.email ?? '—'}</div>
          <div className="text-[11px] text-muted-foreground">
            {church.phone ?? '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      className: 'hidden lg:table-cell text-[12px] text-muted-foreground',
      cell: (church) => formatDate(church.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (church) => <ChurchStatusBadge isActive={church.isActive} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (church) => <RowActions church={church} />,
    },
  ];

  return (
    <DataTable data={churches} columns={columns} rowKey={(c) => c.id} />
  );
}

function RowActions({ church }: { church: Church }) {
  const remove = useDeleteChurch();
  const [confirmKey, setConfirmKey] = useState(0);

  return (
    <ConfirmInline
      key={confirmKey}
      pending={remove.isPending}
      onConfirm={() => {
        remove.mutate(church.id, {
          onSuccess: () => setConfirmKey((k) => k + 1),
        });
      }}
    >
      {(open) => (
        <div className="inline-flex items-center gap-1">
          <Link
            href={`/dashboard/churches/${church.id}`}
            aria-label={`Open ${church.name}`}
            className={cn(
              'grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
            )}
          >
            <FiArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            aria-label={`Delete ${church.name}`}
            onClick={open}
            className={cn(
              'grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors',
              'hover:bg-destructive/10 hover:text-destructive',
            )}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )}
    </ConfirmInline>
  );
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
