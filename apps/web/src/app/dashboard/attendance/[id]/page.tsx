'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  useMarkAttendance,
  useReviewSession,
  useSession,
  useSubmitSession,
  useUpdateSession,
} from '@/hooks/attendance';
import { useHasRole } from '@/hooks/auth';
import { useMembers } from '@/hooks/members';
import { BackLink } from '@/components/admin/BackLink';
import { Button } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { PageHeader } from '@/components/admin/PageHeader';
import { PanelCard } from '@/components/admin/PanelCard';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { StatusPill } from '@/components/attendance/StatusPill';
import { Alert } from '@/components/ui/alert';
import { fadeUp, stagger } from '@/shared/lib/motion';
import type { SessionDetail } from '@/types/attendance';

const field =
  'h-11 w-full rounded-[var(--radius-cards)] border border-black/[0.1] bg-snow px-3 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:border-white/[0.1]';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession(id);
  // ponytail: one page of members (cap 100). Add search/pagination here if a
  // church outgrows it.
  const membersQuery = useMembers({ page: 1, pageSize: 100 });
  const mark = useMarkAttendance(id);
  const update = useUpdateSession(id);
  const submit = useSubmitSession(id);
  const review = useReviewSession(id);
  const canReview = useHasRole('ADMIN', 'DEPARTMENT_LEADER');

  const detail = session.data;
  const locked = detail?.status === 'REVIEWED';

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  // Seed local state from the saved session once it loads.
  useEffect(() => {
    if (detail) {
      setChecked(new Set(detail.present.map((p) => p.memberId)));
      setTitle(detail.title);
      setDate(detail.date.slice(0, 10)); // ISO → yyyy-mm-dd for the date input
    }
  }, [detail]);

  const members = membersQuery.data?.data ?? [];

  const rollDirty = useMemo(() => {
    const saved = new Set(detail?.present.map((p) => p.memberId) ?? []);
    if (saved.size !== checked.size) return true;
    for (const c of checked) if (!saved.has(c)) return true;
    return false;
  }, [checked, detail]);

  const detailsDirty =
    !!detail && (title.trim() !== detail.title || date !== detail.date.slice(0, 10));

  const toggle = (memberId: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });

  const loading = session.isLoading || membersQuery.isLoading;
  const error = session.error ?? membersQuery.error;
  const actionError =
    mark.error ?? update.error ?? submit.error ?? review.error;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[760px]"
    >
      <BackLink href="/dashboard/attendance" label="Attendance" />

      {error ? (
        <Alert className="mt-6">{error.message}</Alert>
      ) : loading || !detail ? (
        <div className="mt-8">
          <TableSkeleton />
        </div>
      ) : (
        <>
          <PageHeader
            eyebrow={<StatusPill status={detail.status} />}
            title={<Emph>{detail.title}</Emph>}
            description={<Provenance detail={detail} />}
          />

          {actionError ? (
            <Alert className="mt-6">{actionError.message}</Alert>
          ) : null}

          {locked ? null : (
            <motion.section variants={fadeUp} className="mt-8">
              <PanelCard title="Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="title" className="text-[13px] text-muted-foreground">
                      Title
                    </label>
                    <input
                      id="title"
                      className={field}
                      value={title}
                      maxLength={200}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="date" className="text-[13px] text-muted-foreground">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      className={field}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!detailsDirty || update.isPending}
                    onClick={() =>
                      update.mutate({
                        title: title.trim(),
                        date: new Date(date).toISOString(),
                      })
                    }
                  >
                    {update.isPending ? 'Saving…' : 'Save details'}
                  </Button>
                </div>
              </PanelCard>
            </motion.section>
          )}

          <motion.section variants={fadeUp} className="mt-6">
            <PanelCard
              title="Roll"
              subtitle={`${checked.size} of ${members.length} present`}
            >
              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {members.map((m) => (
                  <li key={m.id}>
                    <label className="flex cursor-pointer items-center gap-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={checked.has(m.id)}
                        disabled={locked}
                        onChange={() => toggle(m.id)}
                        className="h-4 w-4 accent-foreground disabled:opacity-50"
                      />
                      <span className="text-[14px] text-foreground">{m.name}</span>
                      {m.phone ? (
                        <span className="text-[12px] text-muted-foreground">
                          {m.phone}
                        </span>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>

              {!locked ? (
                <div className="mt-5 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!rollDirty || mark.isPending}
                    onClick={() => mark.mutate([...checked])}
                  >
                    {mark.isPending ? 'Saving…' : 'Save roll'}
                  </Button>
                </div>
              ) : null}
            </PanelCard>
          </motion.section>

          <motion.div variants={fadeUp} className="mt-6 flex justify-end gap-3">
            {detail.status === 'DRAFT' ? (
              <Button
                type="button"
                disabled={submit.isPending || rollDirty}
                onClick={() => submit.mutate()}
              >
                {submit.isPending ? 'Submitting…' : 'Submit for review'}
              </Button>
            ) : null}
            {detail.status === 'SUBMITTED' && canReview ? (
              <Button
                type="button"
                disabled={review.isPending}
                onClick={() => review.mutate()}
              >
                {review.isPending ? 'Reviewing…' : 'Mark reviewed'}
              </Button>
            ) : null}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

function Provenance({ detail }: { detail: SessionDetail }) {
  return (
    <span>
      {formatDate(detail.date)} · Recorded by {detail.recordedBy.name}
      {detail.reviewedBy
        ? ` · Reviewed by ${detail.reviewedBy.name}${
            detail.reviewedAt ? ` on ${formatDate(detail.reviewedAt)}` : ''
          }`
        : ''}
    </span>
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
