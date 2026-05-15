'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface Props {
  /** Small uppercase label sitting above the title (e.g. "Platform · all tenants"). */
  eyebrow?: ReactNode;
  /** Main title — pass an `<Emph>` child to italicize part of it. */
  title: ReactNode;
  /** Sub-line under the title. Keep to one or two short sentences. */
  description?: ReactNode;
  /** Right-side slot for primary actions (e.g. a `LinkButton`). */
  action?: ReactNode;
  className?: string;
}

/**
 * Page-level header used on every dashboard route.
 *
 * Renders the eyebrow / title / description / action stack the design system
 * uses across the app: editorial display title with optional italic emphasis,
 * tangerine-on-pebble eyebrow, and action slot that wraps below the heading
 * on small screens.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <motion.header
      variants={fadeUp}
      className={cn('flex flex-wrap items-end justify-between gap-6', className)}
    >
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[12px] uppercase tracking-[0.1em] text-pebble">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-[36px] leading-[1.1] tracking-[-0.5px] text-carbon">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[14px] text-stone">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.header>
  );
}
