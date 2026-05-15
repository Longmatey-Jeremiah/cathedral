'use client';

import { motion } from 'framer-motion';
import { ServicesTable } from '@/features/attendance/components/ServicesTable';
import {
  attendanceTrend,
  services,
} from '@/features/attendance/mock-data';
import { Emph } from '@/shared/components/Emph';
import { KpiCard } from '@/shared/components/admin/KpiCard';
import { MiniBarChart } from '@/shared/components/admin/MiniBarChart';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { PanelCard } from '@/shared/components/admin/PanelCard';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function AttendancePage() {
  const latest = services[0];
  const previous = services[1];
  const delta = latest && previous
    ? ((latest.total - previous.total) / previous.total) * 100
    : 0;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow="Last 7 services"
        title={
          <>
            <Emph>Attendance</Emph>
          </>
        }
        description="Service-level rolls, first-time visitors, children check-ins, and volunteer coverage. Quiet, exportable, never a spreadsheet."
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Last service"
          value={latest.total.toLocaleString()}
          delta={`${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% vs prior`}
          tone={delta >= 0 ? 'positive' : 'warn'}
        />
        <KpiCard
          label="First-time visitors"
          value={String(latest.firstTimers)}
          delta="Last service"
          tone="positive"
        />
        <KpiCard
          label="Children check-ins"
          value={latest.children.toLocaleString()}
          delta="Last service"
          tone="neutral"
        />
        <KpiCard
          label="Volunteer slots"
          value={`${latest.volunteersFilled} / ${latest.volunteersTotal}`}
          delta={
            latest.volunteersFilled === latest.volunteersTotal
              ? 'Fully covered'
              : `${latest.volunteersTotal - latest.volunteersFilled} unfilled`
          }
          tone={
            latest.volunteersFilled === latest.volunteersTotal ? 'positive' : 'warn'
          }
        />
      </section>

      <motion.section variants={fadeUp} className="mt-6">
        <PanelCard
          title="Attendance trend"
          subtitle="Total attendance · last 6 services"
        >
          <MiniBarChart bars={attendanceTrend} height={180} />
        </PanelCard>
      </motion.section>

      <motion.section variants={fadeUp} className="mt-6">
        <h2 className="mb-4 font-display text-[20px] text-foreground">
          Services
        </h2>
        <ServicesTable services={services} />
      </motion.section>
    </motion.div>
  );
}
