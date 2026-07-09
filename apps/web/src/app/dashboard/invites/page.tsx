'use client';

import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import { InvitesTable } from '@/components/invites/InvitesTable';
import { EmptyState } from '@/components/admin/EmptyState';
import { useInvites } from '@/hooks/invites';
import { inviteStatus } from '@/types/invites';
import { LinkButton } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { KpiCard } from '@/components/admin/KpiCard';
import { PageHeader } from '@/components/admin/PageHeader';
import { stagger } from '@/shared/lib/motion';

export default function InvitesPage() {
  const { data: invites = [], isLoading } = useInvites();

  const pending = invites.filter((i) => inviteStatus(i) === 'pending').length;
  const used = invites.filter((i) => inviteStatus(i) === 'used').length;
  const expired = invites.filter((i) => inviteStatus(i) === 'expired').length;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow={`${invites.length} invites total`}
        title={
          <>
            <Emph>Invites</Emph>
          </>
        }
        description="Email-scoped invitations bound to a role and a single church. Tokens are hashed at rest, single-use, and expire after 72 hours by default."
        action={
          <LinkButton href="/dashboard/invites/new" size="md">
            <FiMail size={16} aria-hidden />
            Send invite
          </LinkButton>
        }
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Pending"
          value={String(pending)}
          delta="Awaiting acceptance"
          tone="warn"
        />
        <KpiCard
          label="Accepted"
          value={String(used)}
          delta="Joined the church"
          tone="positive"
        />
        <KpiCard
          label="Expired"
          value={String(expired)}
          delta="Token never used"
          tone="neutral"
        />
      </section>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading invites…</p>
        ) : invites.length === 0 ? (
          <EmptyState
            icon={FiMail}
            title="No invites yet"
            description="Invite a teammate and they'll get a single-use link tied to the role you choose."
            action={
              <LinkButton href="/dashboard/invites/new" size="md">
                <FiMail size={16} aria-hidden />
                Send invite
              </LinkButton>
            }
          />
        ) : (
          <InvitesTable invites={invites} />
        )}
      </div>
    </motion.div>
  );
}
