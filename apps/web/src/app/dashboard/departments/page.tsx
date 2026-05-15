'use client';

import { motion } from 'framer-motion';
import { DepartmentCard } from '@/features/departments/components/DepartmentCard';
import { departments } from '@/features/departments/mock-data';
import { Emph } from '@/shared/components/Emph';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { stagger } from '@/shared/lib/motion';

export default function DepartmentsPage() {
  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={`${departments.length} departments`}
        title={
          <>
            <Emph>Departments</Emph>
          </>
        }
        description="The teams that keep Sunday running. Each department has a leader, a meeting cadence, and a roster — wired through to attendance and giving."
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <DepartmentCard key={d.id} department={d} />
        ))}
      </section>
    </motion.div>
  );
}
