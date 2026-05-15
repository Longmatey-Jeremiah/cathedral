'use client';

import { motion } from 'framer-motion';
import type { ComponentType, ReactNode } from 'react';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface Props {
  /** A `react-icons` component shown inside the soft circle. */
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: ReactNode;
  /** Action slot — typically a `LinkButton` or `Button`. */
  action?: ReactNode;
  className?: string;
}

/** Dashed-border empty-state card used when a list has no rows yet. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'rounded-[var(--radius-cards)] border border-dashed border-black/[0.1] bg-snow p-10 text-center',
        'dark:border-white/[0.1]',
        className,
      )}
    >
      {Icon ? (
        <div
          aria-hidden
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fog dark:bg-white/[0.06]"
        >
          <Icon size={18} className="text-stone" />
        </div>
      ) : null}
      <h2 className="mt-4 font-display text-[20px] text-carbon">{title}</h2>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-stone">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  );
}
