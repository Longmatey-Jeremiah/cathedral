'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCreateMember } from '@/hooks/members';
import { Emph } from '@/components/Emph';
import { BackLink } from '@/components/admin/BackLink';
import { PageHeader } from '@/components/admin/PageHeader';
import { MemberForm, toMemberPayload } from '@/components/members/MemberForm';
import { Alert } from '@/components/ui/alert';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function NewMemberPage() {
  const [created, setCreated] = useState(false);

  // POST /members — a church/domain record, separate from any auth account.
  const create = useCreateMember({ onSuccess: () => setCreated(true) });

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[760px]"
    >
      <motion.div variants={fadeUp}>
        <BackLink href="/dashboard/members" label="Back to members" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="New member"
        title={
          <>
            Add a <Emph>member</Emph>.
          </>
        }
        description="The membership form. Only the names are required — everything else can wait until the signed form comes back."
      />

      {created ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert tone="success">Member added to the directory.</Alert>
        </motion.div>
      ) : null}

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <MemberForm
          submitLabel="Add member"
          pendingLabel="Adding…"
          isPending={create.isPending}
          serverError={create.error}
          onSubmit={(values) => create.mutate(toMemberPayload(values))}
        />
      </motion.section>
    </motion.div>
  );
}

export const dynamic = 'force-dynamic';
