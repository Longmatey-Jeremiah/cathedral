'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { MembersTable } from '@/components/members/MembersTable';
import { useMembers } from '@/hooks/members';
import { LinkButton } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { stagger } from '@/shared/lib/motion';

export default function MembersPage() {
  const { data, isLoading, error } = useMembers();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((m) =>
      `${m.firstName} ${m.lastName} ${m.email} ${m.department ?? ''}`
        .toLowerCase()
        .includes(needle),
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
        eyebrow={data ? `${data.length} people` : 'People'}
        title={
          <>
            <Emph>Members</Emph>
          </>
        }
        description="Everyone with an account in your church. Roles drive what they can see — promote leaders, retire viewers, keep the directory honest."
        action={
          <LinkButton href="/dashboard/members/new" size="md">
            <FiUserPlus size={16} aria-hidden />
            Add a member
          </LinkButton>
        }
      />

      <div className="mt-8">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search by name, email, or department"
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
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`No member matches "${query}"`}
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
          <MembersTable members={filtered} />
        )}
      </div>
    </motion.div>
  );
}

export const dynamic = 'force-dynamic';
