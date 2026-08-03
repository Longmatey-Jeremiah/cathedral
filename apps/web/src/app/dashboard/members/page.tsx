'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiUploadCloud, FiUserPlus } from 'react-icons/fi';
import {
  MembersTable,
  memberExportColumns,
} from '@/components/members/MembersTable';
import { useMembers } from '@/hooks/members';
import { membersService } from '@/services/members.service';
import { ExportMenu } from '@/components/admin/ExportMenu';
import { LinkButton } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { fetchAllPages } from '@/shared/lib/export';
import { stagger } from '@/shared/lib/motion';

const PAGE_SIZE = 25;

export default function MembersPage() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the search box so each keystroke doesn't fire a request, and
  // reset to the first page whenever the term changes.
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  const { data, isLoading, error } = useMembers({ page, pageSize: PAGE_SIZE, q });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const members = data?.data ?? [];

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={data ? `${total} people` : 'People'}
        title={
          <>
            <Emph>Members</Emph>
          </>
        }
        description="Everyone with an account in your church. Roles drive what they can see — promote leaders, retire viewers, keep the directory honest."
        action={
          <div className="flex items-center gap-2">
            <LinkButton href="/dashboard/members/import" size="md" variant="ghost">
              <FiUploadCloud size={16} aria-hidden />
              Import
            </LinkButton>
            <LinkButton href="/dashboard/members/new" size="md">
              <FiUserPlus size={16} aria-hidden />
              Add a member
            </LinkButton>
          </div>
        }
      />

      <div className="mt-8">
        <FilterBar
          query={input}
          onQueryChange={setInput}
          placeholder="Search by name or phone"
        >
          <ExportMenu
            name="members"
            columns={memberExportColumns}
            disabled={total === 0}
            rows={() =>
              fetchAllPages((exportPage, pageSize) =>
                membersService.list({ page: exportPage, pageSize, q }),
              )
            }
          />
        </FilterBar>
      </div>

      <div className="mt-6">
        {error ? (
          <Alert>
            {error.status === 0
              ? 'Could not reach the server. Check your connection and try again.'
              : error.message}
          </Alert>
        ) : isLoading ? (
          <TableSkeleton />
        ) : members.length === 0 ? (
          q ? (
            <EmptyState
              title={`No member matches "${q}"`}
              action={
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear search
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={FiUserPlus}
              title="No members yet"
              description="Add the first person to your church. They will receive a one-time password to sign in and set their own."
              action={
                <LinkButton href="/dashboard/members/new" size="md">
                  <FiUserPlus size={16} aria-hidden />
                  Add a member
                </LinkButton>
              }
            />
          )
        ) : (
          <>
            <MembersTable members={members} />
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

export const dynamic = 'force-dynamic';
