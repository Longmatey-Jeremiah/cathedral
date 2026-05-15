'use client';

import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import { ContributionsTable } from '@/features/giving/components/ContributionsTable';
import {
  contributions,
  formatMoney,
  funds,
} from '@/features/giving/mock-data';
import { Emph } from '@/shared/components/Emph';
import { KpiCard } from '@/shared/components/admin/KpiCard';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { PanelCard } from '@/shared/components/admin/PanelCard';
import { ProgressBar } from '@/shared/components/admin/ProgressBar';
import { Button } from '@/shared/components/ui/button';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function GivingPage() {
  const total = funds.reduce((sum, f) => sum + f.amount, 0);
  const recurringCount = contributions.filter((c) => c.recurring).length;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow="November · all funds"
        title={
          <>
            <Emph>Giving</Emph>
          </>
        }
        description="Tithes, designated funds, and recurring schedules — reconciled and exportable. Edits are immutable in the audit log."
        action={
          <Button variant="ghost" size="md">
            <FiDownload size={16} aria-hidden />
            Export CSV
          </Button>
        }
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total · MTD"
          value={formatMoney(total)}
          delta="+8.6% vs October"
          tone="positive"
        />
        <KpiCard
          label="Recurring givers"
          value={String(recurringCount)}
          delta="Active this month"
          tone="neutral"
        />
        <KpiCard
          label="Largest fund"
          value="Tithes"
          delta={`${funds[0].share}% of total`}
          tone="neutral"
        />
        <KpiCard
          label="Reconciled"
          value="100%"
          delta="No exceptions"
          tone="positive"
        />
      </section>

      <motion.section variants={fadeUp} className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard
          title="By fund"
          subtitle="Allocation of November contributions"
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {funds.map((f) => (
              <ProgressBar
                key={f.label}
                label={f.label}
                trailing={formatMoney(f.amount)}
                value={f.share}
              />
            ))}
          </div>
        </PanelCard>

        <PanelCard
          title="Recent contributions"
          subtitle="Last 6 entries · all methods"
          className="lg:col-span-2"
        >
          <ContributionsTable contributions={contributions} />
        </PanelCard>
      </motion.section>
    </motion.div>
  );
}
