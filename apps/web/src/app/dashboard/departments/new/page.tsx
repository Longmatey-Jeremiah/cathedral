'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DepartmentForm } from '@/components/departments/DepartmentForm';
import { useCreateDepartment } from '@/hooks/departments';
import { Emph } from '@/components/Emph';
import { BackLink } from '@/components/admin/BackLink';
import { PageHeader } from '@/components/admin/PageHeader';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function CreateDepartmentPage() {
  const router = useRouter();
  const create = useCreateDepartment({
    onSuccess: (department) => {
      router.push(`/dashboard/departments/${department.id}`);
    },
  });

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[760px]"
    >
      <motion.div variants={fadeUp}>
        <BackLink href="/dashboard/departments" label="Back to departments" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="New department"
        title={
          <>
            Create a <Emph>department</Emph>.
          </>
        }
        description="Name the team and describe what it does. You can edit it any time."
      />

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <DepartmentForm
          submitLabel="Create department"
          pendingLabel="Creating…"
          onSubmit={(values) => create.mutate(values)}
          isPending={create.isPending}
          serverError={create.error ?? null}
        />
      </motion.section>
    </motion.div>
  );
}
