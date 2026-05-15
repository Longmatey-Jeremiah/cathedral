'use client';

import { motion } from 'framer-motion';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { reports } from '@/features/reports/mock-data';
import { Emph } from '@/shared/components/Emph';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { cn } from '@/shared/lib/cn';

export default function ReportsPage() {
  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow="Exportable · CSV"
        title={
          <>
            <Emph>Reports</Emph>
          </>
        }
        description="The board pack, just less frantic. Each report is reproducible, exportable, and timestamped."
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map(({ icon: Icon, ...r }) => (
          <motion.article
            key={r.id}
            variants={fadeUp}
            className={cn(
              'group flex flex-col rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card',
              'transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]',
            )}
          >
            <div className="flex items-start justify-between">
              <span
                aria-hidden
                className="grid h-10 w-10 place-items-center rounded-[10px] bg-muted text-foreground"
              >
                <Icon size={18} />
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <FiClock size={12} aria-hidden />
                {r.cadence}
              </span>
            </div>

            <h3 className="mt-5 font-display text-[20px] text-foreground">
              {r.title}
            </h3>
            <p className="mt-2 flex-1 text-[13px] leading-[1.55] text-muted-foreground">
              {r.description}
            </p>

            <div className="mt-5 flex items-center gap-2">
              <Button size="sm" variant="ghost">
                Generate
                <FiArrowRight size={14} aria-hidden />
              </Button>
              <Button size="sm" variant="link">
                History
              </Button>
            </div>
          </motion.article>
        ))}
      </section>
    </motion.div>
  );
}
