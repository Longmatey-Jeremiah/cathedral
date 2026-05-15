'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ChurchForm } from '@/features/churches/components/ChurchForm';
import { ChurchStatusBadge } from '@/features/churches/components/ChurchStatusBadge';
import {
  useChurch,
  useDeleteChurch,
  useUpdateChurch,
} from '@/features/churches/hooks';
import { Emph } from '@/shared/components/Emph';
import { BackLink } from '@/shared/components/admin/BackLink';
import { DangerZone } from '@/shared/components/admin/DangerZone';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { FormSkeleton } from '@/shared/components/admin/Skeleton';
import { Alert } from '@/shared/components/ui/alert';
import { fadeUp, stagger } from '@/shared/lib/motion';

export default function ChurchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { data: church, isLoading, error } = useChurch(id);
  const update = useUpdateChurch(id);
  const remove = useDeleteChurch({
    onSuccess: () => router.push('/dashboard/churches'),
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

      {error ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert>
            {error.status === 404
              ? 'This church no longer exists.'
              : error.status === 0
                ? 'Could not reach the server. Try again in a moment.'
                : error.message}
          </Alert>
        </motion.div>
      ) : isLoading || !church ? (
        <motion.div variants={fadeUp} className="mt-6">
          <FormSkeleton fields={5} />
        </motion.div>
      ) : (
        <>
          <PageHeader
            className="mt-3"
            eyebrow="Tenant"
            title={
              <span className="flex flex-wrap items-center gap-3">
                <Emph>{church.name}</Emph>
                <ChurchStatusBadge isActive={church.isActive} />
              </span>
            }
            description={`Created ${formatDate(church.createdAt)} · last updated ${formatDate(church.updatedAt)}`}
          />

          <motion.section
            variants={fadeUp}
            className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
          >
            <ChurchForm
              defaultValues={{
                name: church.name,
                slug: church.slug,
                address: church.address ?? '',
                phone: church.phone ?? '',
                email: church.email ?? '',
                isActive: church.isActive,
              }}
              submitLabel="Save changes"
              pendingLabel="Saving…"
              isPending={update.isPending}
              serverError={update.error ?? null}
              onSubmit={(values) => update.mutate(values)}
              autoSlug={false}
            />

            {update.isSuccess ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-right text-[12px] text-emerald-600 dark:text-emerald-400"
              >
                Saved.
              </motion.p>
            ) : null}
          </motion.section>

          <div className="mt-6">
            <DangerZone
              title="Delete this church"
              description="Removes the tenant and cascades to its users and pending invites. This cannot be undone."
              actionLabel="Delete church"
              pending={remove.isPending}
              onConfirm={() => remove.mutate(church.id)}
            />
          </div>

          {remove.error ? (
            <motion.div variants={fadeUp} className="mt-4">
              <Alert>{remove.error.message}</Alert>
            </motion.div>
          ) : null}
        </>
      )}
    </motion.div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
