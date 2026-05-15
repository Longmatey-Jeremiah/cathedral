'use client';

import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface Props {
  title: string;
  description: ReactNode;
  /** Label on the resting-state destructive button. */
  actionLabel?: string;
  /** Label after the user clicks "delete" once. */
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  className?: string;
}

/**
 * Dusty-rose card grouping a destructive action. Two-step confirmation lives
 * inside the card so the resting state never renders a bare red button on the
 * page.
 */
export function DangerZone({
  title,
  description,
  actionLabel = 'Delete',
  confirmLabel = 'Confirm delete',
  pending = false,
  onConfirm,
  className,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <motion.section
      variants={fadeUp}
      className={cn(
        'rounded-[var(--radius-cards)] border border-dusty-rose/30 bg-dusty-rose/5 p-6',
        'sm:flex sm:items-center sm:justify-between sm:gap-6',
        className,
      )}
    >
      <div>
        <h2 className="font-display text-[18px] text-carbon">{title}</h2>
        <p className="mt-1 text-[12px] text-stone">{description}</p>
      </div>

      {confirming ? (
        <div className="mt-4 flex items-center gap-2 sm:mt-0 sm:shrink-0">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="text-[13px] text-stone hover:text-carbon disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--radius-buttons)] bg-dusty-rose px-4 py-2 text-[13px] font-medium text-white',
              'transition-colors hover:bg-dusty-rose/90 disabled:opacity-60',
            )}
          >
            <FiTrash2 size={14} aria-hidden />
            {pending ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={cn(
            'mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-buttons)] border border-dusty-rose/40 bg-snow px-4 py-2 text-[13px] font-medium text-dusty-rose',
            'transition-colors hover:bg-dusty-rose/10 sm:mt-0 sm:shrink-0',
            'dark:bg-transparent',
          )}
        >
          <FiTrash2 size={14} aria-hidden />
          {actionLabel}
        </button>
      )}
    </motion.section>
  );
}
