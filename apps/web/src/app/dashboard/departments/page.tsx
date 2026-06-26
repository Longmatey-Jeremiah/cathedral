'use client';

import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { DepartmentCard } from '@/components/departments/DepartmentCard';
import { useDepartments } from '@/hooks/departments';
import { useHasRole } from '@/hooks/auth';
import { LinkButton } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { stagger } from '@/shared/lib/motion';
import { UserRole } from '@/shared/lib/types';

export default function DepartmentsPage() {
  const { data, isLoading, error } = useDepartments();
  const canManage = useHasRole(UserRole.ADMIN);

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={data ? `${data.length} departments` : 'Departments'}
        title={
          <>
            <Emph>Departments</Emph>
          </>
        }
        description="The teams that keep Sunday running. Create a department, give it a name and a short description."
        action={
          canManage ? (
            <LinkButton href="/dashboard/departments/new" size="md">
              <FiPlus size={16} aria-hidden />
              New department
            </LinkButton>
          ) : undefined
        }
      />

      <div className="mt-8">
        {error ? (
          <Alert>
            {error.status === 0
              ? 'Could not reach the server. Check your connection and try again.'
              : error.message}
          </Alert>
        ) : isLoading ? (
          <TableSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={FiPlus}
            title="No departments yet"
            description="Departments group your staff and volunteers by what they do."
            action={
              canManage ? (
                <LinkButton href="/dashboard/departments/new" size="md">
                  <FiPlus size={16} aria-hidden />
                  Create the first department
                </LinkButton>
              ) : undefined
            }
          />
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((d) => (
              <DepartmentCard key={d.id} department={d} />
            ))}
          </section>
        )}
      </div>
    </motion.div>
  );
}

export const dynamic = 'force-dynamic';
