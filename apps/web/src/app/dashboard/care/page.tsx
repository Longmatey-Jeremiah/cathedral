'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiHeart, FiPlus } from 'react-icons/fi';
import {
  CareNotesTable,
  careNoteExportColumns,
} from '@/components/care/CareNotesTable';
import { useCareNotes, useCareSummary, useResolveCareNote } from '@/hooks/care';
import { careService } from '@/services/care.service';
import { LinkButton } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { EmptyState } from '@/components/admin/EmptyState';
import { ExportMenu } from '@/components/admin/ExportMenu';
import { FilterBar } from '@/components/admin/FilterBar';
import { KpiCard } from '@/components/admin/KpiCard';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/shared/lib/cn';
import { fetchAllPages } from '@/shared/lib/export';
import { stagger } from '@/shared/lib/motion';
import type { FollowUpFilter } from '@/types/care';

const PAGE_SIZE = 25;

const FILTERS: { value: FollowUpFilter | 'all'; label: string }[] = [
  { value: 'all', label: 'All notes' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
];

export default function CarePage() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [followUp, setFollowUp] = useState<FollowUpFilter | 'all'>('all');
  const [page, setPage] = useState(1);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Debounce the search box; reset to page one whenever the term changes.
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  const { data, isLoading, error } = useCareNotes({
    page,
    pageSize: PAGE_SIZE,
    q,
    ...(followUp === 'all' ? {} : { followUp }),
  });
  const summary = useCareSummary();

  const resolve = useResolveCareNote({
    onSettled: () => setResolvingId(null),
  });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const notes = data?.data ?? [];

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={data ? `${total} notes` : 'Pastoral care'}
        title={
          <>
            <Emph>Care</Emph>
          </>
        }
        description="Visits, calls, prayer requests and counselling — logged against a member, with follow-ups that stay visible until someone closes them. Confidential notes are visible only to their author and admins."
        action={
          <LinkButton href="/dashboard/care/new" size="md">
            <FiPlus size={16} aria-hidden />
            Log care
          </LinkButton>
        }
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Overdue follow-ups"
          value={summary.data ? String(summary.data.overdue) : '—'}
          delta={
            summary.data?.overdue
              ? 'Someone is waiting on a call'
              : 'Nothing overdue'
          }
          tone={summary.data?.overdue ? 'warn' : 'positive'}
        />
        <KpiCard
          label="Open follow-ups"
          value={summary.data ? String(summary.data.openFollowUps) : '—'}
          delta="Scheduled, not yet resolved"
          tone="neutral"
        />
        <KpiCard
          label="Notes this month"
          value={summary.data ? String(summary.data.notesThisMonth) : '—'}
          delta="Across all care types"
          tone="neutral"
        />
      </section>

      <div className="mt-8">
        <FilterBar
          query={input}
          onQueryChange={setInput}
          placeholder="Search note text"
        >
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Follow-up filter">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={followUp === f.value}
                onClick={() => {
                  setFollowUp(f.value);
                  setPage(1);
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] transition',
                  followUp === f.value
                    ? 'bg-carbon text-white dark:bg-white/[0.14]'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <ExportMenu
            name="care-notes"
            columns={careNoteExportColumns}
            disabled={total === 0}
            rows={() =>
              fetchAllPages((exportPage, pageSize) =>
                careService.list({
                  page: exportPage,
                  pageSize,
                  q,
                  ...(followUp === 'all' ? {} : { followUp }),
                }),
              )
            }
          />
        </FilterBar>
      </div>

      {resolve.error ? (
        <div className="mt-4">
          <Alert>{resolve.error.message}</Alert>
        </div>
      ) : null}

      <div className="mt-6">
        {error ? (
          <Alert>
            {error.status === 0
              ? 'Could not reach the server. Check your connection and try again.'
              : error.message}
          </Alert>
        ) : isLoading ? (
          <TableSkeleton />
        ) : notes.length === 0 ? (
          <EmptyState
            icon={FiHeart}
            title={emptyTitle(q, followUp)}
            description={
              q || followUp !== 'all'
                ? undefined
                : 'Log a visit, a call or a prayer request. Set a follow-up date and it stays on this list until someone closes it.'
            }
            action={
              q || followUp !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    setFollowUp('all');
                  }}
                  className="text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear filters
                </button>
              ) : (
                <LinkButton href="/dashboard/care/new" size="md">
                  <FiPlus size={16} aria-hidden />
                  Log care
                </LinkButton>
              )
            }
          />
        ) : (
          <>
            <CareNotesTable
              notes={notes}
              resolvingId={resolvingId}
              onResolve={(id) => {
                setResolvingId(id);
                resolve.mutate(id);
              }}
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

function emptyTitle(q: string, followUp: FollowUpFilter | 'all'): string {
  if (q) return `No note matches "${q}"`;
  if (followUp === 'overdue') return 'Nothing overdue — everyone has been reached';
  if (followUp === 'open') return 'No open follow-ups';
  if (followUp === 'resolved') return 'No resolved follow-ups yet';
  return 'No care logged yet';
}

export const dynamic = 'force-dynamic';
