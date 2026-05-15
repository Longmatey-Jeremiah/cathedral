'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight, FiMail, FiPlus, FiUserPlus } from 'react-icons/fi';
import { fadeUp } from '@/shared/lib/motion';
import { UserRole, type UserRole as UserRoleT } from '@/shared/lib/types';
import { cn } from '@/shared/lib/cn';

interface Action {
  label: string;
  description: string;
  href: string;
  icon: typeof FiPlus;
  /** Roles that may take this action. SUPER_ADMIN sees everything. */
  roles?: UserRoleT[];
}

const actions: Action[] = [
  {
    label: 'Create church',
    description: 'Spin up a new tenant',
    href: '/dashboard/churches/new',
    icon: FiPlus,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    label: 'Invite a teammate',
    description: 'Email-scoped role invite',
    href: '/dashboard/invites/new',
    icon: FiMail,
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Add a member',
    description: 'Manual create with temp password',
    href: '/dashboard/members/new',
    icon: FiUserPlus,
    roles: [UserRole.ADMIN],
  },
];

export function QuickActions({ role }: { role: UserRoleT }) {
  const visible = actions.filter(
    (a) => !a.roles || role === UserRole.SUPER_ADMIN || a.roles.includes(role),
  );

  if (visible.length === 0) return null;

  return (
    <motion.section
      variants={fadeUp}
      className="rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card"
    >
      <h3 className="font-display text-[18px] text-foreground">Quick actions</h3>
      <p className="mt-0.5 text-[12px] text-muted-foreground">
        Things you reach for most often.
      </p>

      <div className="mt-5 grid gap-3">
        {visible.map(({ label, description, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'group flex items-center gap-3 rounded-[var(--radius-cardinner)] px-3 py-3',
              'transition-colors hover:bg-muted',
            )}
          >
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-muted text-foreground"
            >
              <Icon size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-foreground">
                {label}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {description}
              </div>
            </div>
            <FiArrowUpRight
              size={16}
              className="shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
