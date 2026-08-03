'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth-context';
import { useUsers } from '@/hooks/users';
import { usersService } from '@/services/users.service';
import { TeamTable, teamExportColumns } from '@/components/users/TeamTable';
import { Emph } from '@/components/Emph';
import { EmptyState } from '@/components/admin/EmptyState';
import { ExportMenu } from '@/components/admin/ExportMenu';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { Alert } from '@/components/ui/alert';
import { fetchAllPages } from '@/shared/lib/export';
import { UserRole } from '@/shared/lib/types';
import { stagger } from '@/shared/lib/motion';

const PAGE_SIZE = 25;
// Roles are assigned by church admins (and super admins). Everyone else is
// bounced — the API enforces the same, this just avoids a dead screen.
const CAN_MANAGE: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

export default function TeamPage() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  const canManage = user ? CAN_MANAGE.includes(user.role) : false;
  const { data, isLoading, error } = useUsers({ page, pageSize: PAGE_SIZE, q });

  if (!user) return null;
  if (!canManage) {
    return (
      <div className="mx-auto w-full max-w-[860px]">
        <Alert>You do not have permission to manage roles.</Alert>
      </div>
    );
  }

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const users = data?.data ?? [];

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={data ? `${total} accounts` : 'Team'}
        title={
          <>
            <Emph>Team &amp; roles</Emph>
          </>
        }
        description="Everyone with an account in your church. A role decides what they can see and do — change it from the picker on each row."
      />

      <div className="mt-8">
        <FilterBar
          query={input}
          onQueryChange={setInput}
          placeholder="Search by name or email"
        >
          <ExportMenu
            name="team"
            columns={teamExportColumns}
            disabled={total === 0}
            rows={() =>
              fetchAllPages((exportPage, pageSize) =>
                usersService.list({ page: exportPage, pageSize, q }),
              )
            }
          />
        </FilterBar>
      </div>

      <div className="mt-6">
        {error ? (
          <Alert>
            {error.status === 0
              ? 'Could not reach the server. Check your connection and try again.'
              : error.message}
          </Alert>
        ) : isLoading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
          <EmptyState
            title={q ? `No account matches "${q}"` : 'No accounts yet'}
            action={
              q ? (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear search
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <TeamTable users={users} />
            {pageCount > 1 ? (
              <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>
                  Page {page} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full px-3 py-1 hover:bg-muted disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    className="rounded-full px-3 py-1 hover:bg-muted disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </motion.div>
  );
}

export const dynamic = 'force-dynamic';
