'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useHasRole } from '@/hooks/auth';
import { useMember, useUpdateMember } from '@/hooks/members';
import { Emph } from '@/components/Emph';
import { BackLink } from '@/components/admin/BackLink';
import { PageHeader } from '@/components/admin/PageHeader';
import { PanelCard } from '@/components/admin/PanelCard';
import { FormSkeleton } from '@/components/admin/Skeleton';
import { MemberDepartments } from '@/components/members/MemberDepartments';
import {
  MemberForm,
  toMemberFormValues,
  toMemberPayload,
} from '@/components/members/MemberForm';
import { Alert } from '@/components/ui/alert';
import { exportDate } from '@/shared/lib/export';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { UserRole } from '@/shared/lib/types';
import type { Member } from '@/types/members';

const STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  VISITOR: 'Visitor',
} as const;

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  // Same set the API's RolesGuard lets through on PATCH /members/:id.
  const canManage = useHasRole(UserRole.SUPER_ADMIN, UserRole.ADMIN);
  const { data: member, isLoading, error } = useMember(id);
  const update = useUpdateMember(id);

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

      {error ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert>
            {error.status === 404
              ? 'This member no longer exists.'
              : error.status === 0
                ? 'Could not reach the server. Try again in a moment.'
                : error.message}
          </Alert>
        </motion.div>
      ) : isLoading || !member ? (
        <motion.div variants={fadeUp} className="mt-6">
          <FormSkeleton fields={2} />
        </motion.div>
      ) : (
        <>
          <PageHeader
            className="mt-3"
            eyebrow={STATUS_LABELS[member.status]}
            title={
              <Emph>
                {member.firstName} {member.lastName}
              </Emph>
            }
            description={`${member.phone ?? 'No phone on file'} · joined ${exportDate(member.joinDate)}`}
          />

          {canManage ? (
            <motion.section
              variants={fadeUp}
              className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
            >
              <MemberForm
                // Remount when the record changes so saved values become the new defaults.
                key={member.updatedAt}
                defaultValues={toMemberFormValues(member)}
                submitLabel="Save changes"
                pendingLabel="Saving…"
                isPending={update.isPending}
                serverError={update.error}
                onSubmit={(values) => update.mutate(toMemberPayload(values))}
              />
            </motion.section>
          ) : (
            <div className="mt-8">
              <PanelCard title="Membership form" subtitle="Only an admin can edit these.">
                <MemberFacts member={member} />
              </PanelCard>
            </div>
          )}

          <div className="mt-8">
            <PanelCard
              title="Departments & roles"
              subtitle={
                canManage
                  ? 'A leader can run their department; a member serves in it.'
                  : 'Only an admin can change these.'
              }
            >
              <MemberDepartments
                memberId={member.id}
                memberName={member.firstName}
                assignments={member.departments}
                canManage={canManage}
              />
            </PanelCard>
          </div>
        </>
      )}
    </motion.div>
  );
}

const SEX_LABELS = { MALE: 'Male', FEMALE: 'Female' } as const;

const MARITAL_LABELS = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  WIDOWED: 'Widowed',
  DIVORCED: 'Divorced',
} as const;

/** Read-only view of the membership form, for anyone who cannot edit it. */
function MemberFacts({ member }: { member: Member }) {
  const facts: [string, string][] = [
    ['Surname', member.lastName],
    ['Other names', member.firstName],
    ['Sex', member.sex ? SEX_LABELS[member.sex] : ''],
    ['Date of birth', exportDate(member.dateOfBirth)],
    ['Place of birth', member.placeOfBirth ?? ''],
    ['Hometown', member.hometown ?? ''],
    ['Tel. no.', member.phone ?? ''],
    ['Address', member.address ?? ''],
    ['Place of residence', member.placeOfResidence ?? ''],
    ['Occupation', member.occupation ?? ''],
    ['Place of work', member.placeOfWork ?? ''],
    ['Society', member.society ?? ''],
    [
      'Marital status',
      member.maritalStatus ? MARITAL_LABELS[member.maritalStatus] : '',
    ],
    ['Name of spouse', member.spouseName ?? ''],
    ['Spouse occupation', member.spouseOccupation ?? ''],
    ['Name of parents', member.parentsName ?? ''],
    ['Next of kin', member.nextOfKin ?? ''],
    ['Name of children', member.childrenNames.join(', ')],
    ['Religious denomination', member.religiousDenomination ?? ''],
    ['Declaration date', exportDate(member.declarationDate)],
  ];

  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[12px] text-muted-foreground">{label}</dt>
          <dd className="text-[14px] text-foreground">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export const dynamic = 'force-dynamic';
