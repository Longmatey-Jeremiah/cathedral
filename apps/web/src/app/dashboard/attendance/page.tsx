'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowUpRight, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDeleteSession, useSessions } from '@/hooks/attendance';
import { useHasRole } from '@/hooks/auth';
import { LinkButton } from '@/components/Button';
import { ConfirmInline } from '@/components/admin/ConfirmInline';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { EmptyState } from '@/components/admin/EmptyState';
import { Emph } from '@/components/Emph';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { StatusPill } from '@/components/attendance/StatusPill';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/shared/lib/cn';
import { stagger } from '@/shared/lib/motion';
import type { SessionListItem } from '@/types/attendance';

const PAGE_SIZE = 25;

const columns: Column<SessionListItem>[] = [
  {
    key: 'title',
    header: 'Service',
    cell: (s) => (
      <span className="text-[14px] font-medium text-foreground">{s.title}</span>
    ),
  },
  {
    key: 'serviceType',
    header: 'Type',
    className: 'hidden sm:table-cell',
    cell: (s) => (
      <span className="text-[13px] text-muted-foreground">
        {s.serviceType ?? '—'}
      </span>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    cell: (s) => (
      <span className="text-[13px] text-muted-foreground">{formatDate(s.date)}</span>
    ),
  },
  {
    key: 'recordedBy',
    header: 'Recorded by',
    className: 'hidden md:table-cell',
    cell: (s) => (
      <span className="text-[13px] text-muted-foreground">{s.recordedBy}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (s) => <StatusPill status={s.status} />,
  },
  {
    key: 'presentCount',
    header: 'Present',
    align: 'right',
    cell: (s) => (
      <span className="font-display text-[16px] text-foreground">
        {s.presentCount.toLocaleString()}
      </span>
    ),
  },
  {
    key: 'actions',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    cell: (s) => <RowActions session={s} />,
  },
];

const iconBtn =
  'grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors';

// Row actions live in their own cell; stop propagation so clicks here don't
// also trigger the row's navigate-to-detail handler.
function RowActions({ session }: { session: SessionListItem }) {
  const remove = useDeleteSession();
  const isAdmin = useHasRole('ADMIN');
  const [confirmKey, setConfirmKey] = useState(0);

  return (
    <div
      className="inline-flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Link
        href={`/dashboard/attendance/${session.id}`}
        aria-label={`View ${session.title}`}
        className={cn(iconBtn, 'hover:bg-muted hover:text-foreground')}
      >
        <FiArrowUpRight size={14} />
      </Link>
      {isAdmin ? (
        <ConfirmInline
          key={confirmKey}
          pending={remove.isPending}
          onConfirm={() =>
            remove.mutate(session.id, {
              onSuccess: () => setConfirmKey((k) => k + 1),
            })
          }
        >
          {(open) => (
            <button
              type="button"
              aria-label={`Delete ${session.title}`}
              onClick={open}
              className={cn(iconBtn, 'hover:bg-destructive/10 hover:text-destructive')}
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </ConfirmInline>
      ) : null}
    </div>
  );
}

export default function AttendancePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSessions({ page, pageSize: PAGE_SIZE });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sessions = data?.data ?? [];

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={data ? `${total} services` : 'Attendance'}
        title={
          <>
            <Emph>Attendance</Emph>
          </>
        }
        description="Record who showed up. Create a service, mark the roll, keep an honest history."
        action={
          <LinkButton href="/dashboard/attendance/new" size="md">
            <FiPlus size={16} aria-hidden />
            New service
          </LinkButton>
        }
      />

      <div className="mt-8">
        {error ? (
          <Alert>
            {error.status === 0
              ? 'Could not reach the server. Check your connection and try again.'
              : error.message}
          </Alert>
        ) : isLoading ? (
          <TableSkeleton />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={FiCalendar}
            title="No services yet"
            description="Create the first service to start recording attendance."
            action={
              <LinkButton href="/dashboard/attendance/new" size="md">
                <FiPlus size={16} aria-hidden />
                New service
              </LinkButton>
            }
          />
        ) : (
          <>
            <DataTable
              data={sessions}
              columns={columns}
              rowKey={(s) => s.id}
              onRowClick={(s) => router.push(`/dashboard/attendance/${s.id}`)}
            />
            {pageCount > 1 ? (
              <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>
                  Page {page} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full px-3 py-1 hover:bg-muted disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    className="rounded-full px-3 py-1 hover:bg-muted disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </motion.div>
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
