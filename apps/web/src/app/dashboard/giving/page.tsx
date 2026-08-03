'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiCreditCard, FiPlus } from 'react-icons/fi';
import {
  ContributionsTable,
  donationExportColumns,
} from '@/components/giving/ContributionsTable';
import { useDonations, useGivingSummary, useReverseDonation } from '@/hooks/giving';
import { givingService } from '@/services/giving.service';
import { ExportMenu } from '@/components/admin/ExportMenu';
import { LinkButton } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { EmptyState } from '@/components/admin/EmptyState';
import { KpiCard } from '@/components/admin/KpiCard';
import { PageHeader } from '@/components/admin/PageHeader';
import { PanelCard } from '@/components/admin/PanelCard';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { fetchAllPages } from '@/shared/lib/export';
import { formatMinor } from '@/shared/lib/money';
import { fadeUp, stagger } from '@/shared/lib/motion';

const PAGE_SIZE = 25;

export default function GivingPage() {
  const [page, setPage] = useState(1);
  const [reversingId, setReversingId] = useState<string | null>(null);

  const summary = useGivingSummary(); // defaults to the current month
  const { data, isLoading, error } = useDonations({
    page,
    pageSize: PAGE_SIZE,
  });

  const reverse = useReverseDonation({
    onSettled: () => setReversingId(null),
  });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const donations = data?.data ?? [];
  const funds = summary.data?.byFund ?? [];
  const currency = summary.data?.currency ?? 'NGN';

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={monthLabel()}
        title={
          <>
            <Emph>Giving</Emph>
          </>
        }
        description="Tithes, designated funds and offerings. The ledger is append-only — a mistake is corrected with a reversal entry, never an edit, so the history always reconciles."
        action={
          <div className="flex items-center gap-2">
            <ExportMenu
              name="giving"
              columns={donationExportColumns}
              disabled={total === 0}
              rows={() =>
                fetchAllPages((exportPage, pageSize) =>
                  givingService.list({ page: exportPage, pageSize }),
                )
              }
            />
            <LinkButton href="/dashboard/giving/new" size="md">
              <FiPlus size={16} aria-hidden />
              Record giving
            </LinkButton>
          </div>
        }
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Total · this month"
          value={
            summary.data ? formatMinor(summary.data.totalMinor, currency) : '—'
          }
          delta="Net of reversals"
          tone="positive"
        />
        <KpiCard
          label="Entries"
          value={summary.data ? String(summary.data.donationCount) : '—'}
          delta="Recorded this month"
          tone="neutral"
        />
        <KpiCard
          label="Largest fund"
          value={funds[0]?.name ?? '—'}
          delta={funds[0] ? `${funds[0].share}% of total` : 'No giving yet'}
          tone="neutral"
        />
      </section>

      {reverse.error ? (
        <div className="mt-4">
          <Alert>{reverse.error.message}</Alert>
        </div>
      ) : null}

      <motion.section
        variants={fadeUp}
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <PanelCard
          title="By fund"
          subtitle="Allocation this month"
          className="lg:col-span-1"
        >
          {summary.isLoading ? (
            <div className="text-[13px] text-muted-foreground">Loading…</div>
          ) : funds.length === 0 ? (
            <div className="text-[13px] text-muted-foreground">
              No giving recorded this month.
            </div>
          ) : (
            <div className="space-y-3">
              {funds.map((f) => (
                <ProgressBar
                  key={f.fundId}
                  label={f.name}
                  trailing={formatMinor(f.amountMinor, currency)}
                  value={f.share}
                />
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard
          title="Ledger"
          subtitle={total ? `${total} entries` : 'All entries'}
          className="lg:col-span-2"
        >
          {error ? (
            <Alert>
              {error.status === 0
                ? 'Could not reach the server. Check your connection and try again.'
                : error.message}
            </Alert>
          ) : isLoading ? (
            <TableSkeleton />
          ) : donations.length === 0 ? (
            <EmptyState
              icon={FiCreditCard}
              title="No giving recorded yet"
              description="Record the first contribution. Cash entries can be anonymous; card and transfer entries usually name the giver."
              action={
                <LinkButton href="/dashboard/giving/new" size="md">
                  <FiPlus size={16} aria-hidden />
                  Record giving
                </LinkButton>
              }
            />
          ) : (
            <>
              <ContributionsTable
                donations={donations}
                reversingId={reversingId}
                onReverse={(id) => {
                  setReversingId(id);
                  reverse.mutate(id);
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
        </PanelCard>
      </motion.section>
    </motion.div>
  );
}

function monthLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export const dynamic = 'force-dynamic';
