'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { ChurchTable } from '@/features/churches/components/ChurchTable';
import { useChurches } from '@/features/churches/hooks';
import { LinkButton } from '@/shared/components/Button';
import { Emph } from '@/shared/components/Emph';
import { EmptyState } from '@/shared/components/admin/EmptyState';
import { FilterBar } from '@/shared/components/admin/FilterBar';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { TableSkeleton } from '@/shared/components/admin/Skeleton';
import { Alert } from '@/shared/components/ui/alert';
import { stagger } from '@/shared/lib/motion';

export default function ChurchesPage() {
  const { data, isLoading, error } = useChurches();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.slug.toLowerCase().includes(needle) ||
        c.address?.toLowerCase().includes(needle),
    );
  }, [data, query]);

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
              {data ? `· ${data.length}` : ''}
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
          query={query}
          onQueryChange={setQuery}
          placeholder="Search by name, slug, or address"
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
        ) : !data || data.length === 0 ? (
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
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`No church matches "${query}"`}
            action={
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear search
              </button>
            }
          />
        ) : (
          <ChurchTable churches={filtered} />
        )}
      </div>
    </motion.div>
  );
}

export const dynamic = 'force-dynamic';
