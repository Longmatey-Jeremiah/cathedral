'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { PlatformUsersTable } from '@/features/platform-users/components/PlatformUsersTable';
import { platformUsers } from '@/features/platform-users/mock-data';
import { Emph } from '@/shared/components/Emph';
import { FilterBar } from '@/shared/components/admin/FilterBar';
import { KpiCard } from '@/shared/components/admin/KpiCard';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { stagger } from '@/shared/lib/motion';

export default function PlatformUsersPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return platformUsers;
    return platformUsers.filter((u) =>
      `${u.firstName ?? ''} ${u.lastName ?? ''} ${u.email} ${u.churchName ?? ''}`
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  const active = platformUsers.filter((u) => u.status === 'ACTIVE').length;
  const pending = platformUsers.filter((u) => u.status === 'PENDING').length;
  const tenants = new Set(
    platformUsers.map((u) => u.churchName).filter(Boolean),
  ).size;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow="Platform · all churches"
        title={
          <>
            <Emph>Platform users</Emph>
          </>
        }
        description="Every account on the platform across every tenant. Use this view sparingly — most administrative actions belong inside the church scope."
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Active"
          value={String(active)}
          delta="Across all tenants"
          tone="positive"
        />
        <KpiCard
          label="Pending"
          value={String(pending)}
          delta="Invites awaiting acceptance"
          tone="warn"
        />
        <KpiCard
          label="Tenants represented"
          value={String(tenants)}
          delta="Distinct churches"
          tone="neutral"
        />
      </section>

      <div className="mt-8">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search by name, email, or church"
        />
      </div>

      <div className="mt-6">
        <PlatformUsersTable users={filtered} />
      </div>
    </motion.div>
  );
}
