'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChurchForm } from '@/features/churches/components/ChurchForm';
import { useCreateChurch } from '@/features/churches/hooks';
import { Emph } from '@/shared/components/Emph';
import { BackLink } from '@/shared/components/admin/BackLink';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function CreateChurchPage() {
  const router = useRouter();
  const create = useCreateChurch({
    onSuccess: (church) => {
      router.push(`/dashboard/churches/${church.id}`);
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
        <BackLink href="/dashboard/churches" label="Back to churches" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="New tenant"
        title={
          <>
            Create a <Emph>church</Emph>.
          </>
        }
        description="Give it a name and a URL-friendly slug. You can invite an administrator right after."
      />

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <ChurchForm
          submitLabel="Create church"
          pendingLabel="Creating…"
          onSubmit={(values) => create.mutate(values)}
          isPending={create.isPending}
          serverError={create.error ?? null}
        />
      </motion.section>
    </motion.div>
  );
}
