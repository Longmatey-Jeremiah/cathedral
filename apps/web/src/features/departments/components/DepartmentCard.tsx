'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight, FiUsers } from 'react-icons/fi';
import { Avatar } from '@/shared/components/admin/Avatar';
import { fadeUp } from '@/shared/lib/motion';
import { cn } from '@/shared/lib/cn';
import type { Department } from '../types';

export function DepartmentCard({ department }: { department: Department }) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card',
        'transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={department.name} tone="tangerine" />
          <div>
            <h3 className="font-display text-[18px] text-foreground">
              {department.name}
            </h3>
            <p className="text-[12px] text-muted-foreground">
              {department.meets}
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/departments/${department.id}`}
          aria-label={`Open ${department.name}`}
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiArrowUpRight size={14} />
        </Link>
      </div>

      <p className="mt-4 text-[13px] leading-[1.5] text-muted-foreground">
        {department.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <FiUsers size={13} aria-hidden />
          <span>{department.membersCount} members</span>
        </div>
        <span className="text-[12px] text-foreground">{department.leader}</span>
      </div>
    </motion.div>
  );
}
