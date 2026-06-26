'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { DepartmentForm } from '@/components/departments/DepartmentForm';
import {
  useDeleteDepartment,
  useDepartment,
  useUpdateDepartment,
} from '@/hooks/departments';
import { useHasRole } from '@/hooks/auth';
import { Emph } from '@/components/Emph';
import { BackLink } from '@/components/admin/BackLink';
import { DangerZone } from '@/components/admin/DangerZone';
import { PageHeader } from '@/components/admin/PageHeader';
import { FormSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { UserRole } from '@/shared/lib/types';

export default function DepartmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const canManage = useHasRole(UserRole.ADMIN);
  const { data: department, isLoading, error } = useDepartment(id);
  const update = useUpdateDepartment(id);
  const remove = useDeleteDepartment({
    onSuccess: () => router.push('/dashboard/departments'),
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

      {error ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert>
            {error.status === 404
              ? 'This department no longer exists.'
              : error.status === 0
                ? 'Could not reach the server. Try again in a moment.'
                : error.message}
          </Alert>
        </motion.div>
      ) : isLoading || !department ? (
        <motion.div variants={fadeUp} className="mt-6">
          <FormSkeleton fields={2} />
        </motion.div>
      ) : (
        <>
          <PageHeader
            className="mt-3"
            eyebrow="Department"
            title={<Emph>{department.name}</Emph>}
            description={`Created ${formatDate(department.createdAt)} · last updated ${formatDate(department.updatedAt)}`}
          />

          <motion.section
            variants={fadeUp}
            className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
          >
            {canManage ? (
              <>
                <DepartmentForm
                  defaultValues={{
                    name: department.name,
                    description: department.description ?? '',
                  }}
                  submitLabel="Save changes"
                  pendingLabel="Saving…"
                  isPending={update.isPending}
                  serverError={update.error ?? null}
                  onSubmit={(values) => update.mutate(values)}
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
              </>
            ) : (
              <p className="text-[14px] leading-[1.6] text-muted-foreground">
                {department.description || 'No description yet.'}
              </p>
            )}
          </motion.section>

          {canManage ? (
            <div className="mt-6">
              <DangerZone
                title="Delete this department"
                description="Removes the department. Members keep their accounts; this cannot be undone."
                actionLabel="Delete department"
                pending={remove.isPending}
                onConfirm={() => remove.mutate(department.id)}
              />
            </div>
          ) : null}

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
