'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { MembersTable } from '@/features/members/components/MembersTable';
import { members as allMembers } from '@/features/members/mock-data';
import { LinkButton } from '@/shared/components/Button';
import { Emph } from '@/shared/components/Emph';
import { EmptyState } from '@/shared/components/admin/EmptyState';
import { FilterBar } from '@/shared/components/admin/FilterBar';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { stagger } from '@/shared/lib/motion';

export default function MembersPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return allMembers;
    return allMembers.filter((m) =>
      `${m.firstName} ${m.lastName} ${m.email} ${m.department ?? ''}`
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={`${allMembers.length} people`}
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
        {filtered.length === 0 ? (
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
