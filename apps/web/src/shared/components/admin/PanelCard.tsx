'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface Props {
  title: string;
  subtitle?: string;
  /** Right-aligned link rendered as a small "→" CTA in the header. */
  action?: { label: string; href: string };
  children: ReactNode;
  className?: string;
}

/**
 * Section card with a header (title / subtitle / optional action link) and
 * a body slot. Used everywhere a chunk of content needs the same elevated
 * snow surface as the rest of the dashboard.
 */
export function PanelCard({ title, subtitle, action, children, className }: Props) {
  return (
    <motion.section
      variants={fadeUp}
      className={cn(
        'rounded-[var(--radius-cards)] border border-black/[0.04] bg-snow p-6 shadow-card',
        'dark:border-white/[0.06]',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[18px] text-carbon">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-stone">{subtitle}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="text-[12px] text-stone underline-offset-4 transition hover:text-carbon hover:underline"
          >
            {action.label} →
          </Link>
        ) : null}
      </header>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}
