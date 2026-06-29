'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { ChurchTable } from '@/components/churches/ChurchTable';
import { useChurches } from '@/hooks/churches';
import { LinkButton } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { stagger } from '@/shared/lib/motion';

const PAGE_SIZE = 25;

export default function ChurchesPage() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  const { data, isLoading, error } = useChurches({ page, pageSize: PAGE_SIZE, q });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const churches = data?.data ?? [];

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow="Platform · all tenants"
        title={
          <>
            <Emph>Churches</Emph>{' '}
            <span className="text-muted-foreground">
              {data ? `· ${total}` : ''}
            </span>
          </>
        }
        description="Every tenant on the platform. Create a new church, edit an existing one, or pause a community without losing its data."
        action={
          <LinkButton href="/dashboard/churches/new" size="md">
            <FiPlus size={16} aria-hidden />
            Create church
          </LinkButton>
        }
      />

      <div className="mt-8">
        <FilterBar
          query={input}
          onQueryChange={setInput}
          placeholder="Search by name or slug"
        />
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
        ) : churches.length === 0 ? (
          q ? (
            <EmptyState
              title={`No church matches "${q}"`}
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
              icon={FiPlus}
              title="No churches yet"
              description="Create the first tenant on the platform. From there, invite an administrator and they will take it from there."
              action={
                <LinkButton href="/dashboard/churches/new" size="md">
                  <FiPlus size={16} aria-hidden />
                  Create the first church
                </LinkButton>
              }
            />
          )
        ) : (
          <>
            <ChurchTable churches={churches} />
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
