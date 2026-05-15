'use client';

import { motion } from 'framer-motion';
import { notFound, useParams } from 'next/navigation';
import { FiCalendar, FiUsers } from 'react-icons/fi';
import { departments } from '@/features/departments/mock-data';
import { members } from '@/features/members/mock-data';
import { MembersTable } from '@/features/members/components/MembersTable';
import { Emph } from '@/shared/components/Emph';
import { Avatar } from '@/shared/components/admin/Avatar';
import { BackLink } from '@/shared/components/admin/BackLink';
import { KpiCard } from '@/shared/components/admin/KpiCard';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function DepartmentDetailPage() {
  const params = useParams<{ id: string }>();
  const department = departments.find((d) => d.id === params.id);
  if (!department) notFound();

  // Pretend the department's members are anyone whose `department` field
  // matches the case-insensitive name. With real data this is a query.
  const departmentMembers = members.filter(
    (m) => m.department?.toLowerCase() === department.name.toLowerCase(),
  );

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <motion.div variants={fadeUp}>
        <BackLink href="/dashboard/departments" label="Back to departments" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="Department"
        title={
          <span className="flex items-center gap-3">
            <Avatar name={department.name} tone="tangerine" size="lg" />
            <Emph>{department.name}</Emph>
          </span>
        }
        description={department.description}
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Members"
          value={String(department.membersCount)}
          delta="Steady this quarter"
          tone="neutral"
        />
        <KpiCard
          label="Leader"
          value={department.leader.split(' ').slice(-1)[0]}
          delta={department.leader}
          tone="neutral"
        />
        <KpiCard
          label="Meets"
          value={department.meets.split('·')[0].trim()}
          delta={department.meets}
          tone="neutral"
        />
      </section>

      <motion.section variants={fadeUp} className="mt-8">
        <h2 className="font-display text-[20px] text-foreground">
          Roster ({departmentMembers.length})
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Active members assigned to this department.
        </p>

        <div className="mt-4">
          {departmentMembers.length > 0 ? (
            <MembersTable members={departmentMembers} />
          ) : (
            <div className="rounded-[var(--radius-cards)] border border-dashed border-border bg-card p-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                No one is assigned to this department yet.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card"
      >
        <h2 className="font-display text-[18px] text-foreground">Meeting cadence</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center gap-3 text-[13px] text-foreground">
            <FiCalendar size={14} className="text-muted-foreground" />
            {department.meets}
          </li>
          <li className="flex items-center gap-3 text-[13px] text-foreground">
            <FiUsers size={14} className="text-muted-foreground" />
            {department.membersCount} members on the roster
          </li>
        </ul>
      </motion.section>
    </motion.div>
  );
}
