'use client';

import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../lib/cn';

export type KpiTone = 'positive' | 'warn' | 'neutral';

interface Props {
  label: string;
  value: string;
  delta?: string;
  tone?: KpiTone;
}

const toneClasses: Record<KpiTone, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-tangerine-deep dark:text-tangerine-tag',
  neutral: 'text-stone',
};

/**
 * Headline number card used at the top of overview pages. Hover reveals a
 * warm tangerine halo to keep the card feeling alive without color noise.
 */
export function KpiCard({ label, value, delta, tone = 'neutral' }: Props) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-cards)]',
        'border border-black/[0.04] bg-snow p-5 shadow-card',
        'transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]',
        'dark:border-white/[0.06]',
      )}
    >
      <span className="text-[12px] uppercase tracking-[0.08em] text-pebble">
        {label}
      </span>

      <div className="mt-4 font-display text-[34px] leading-none text-carbon">
        {value}
      </div>

      {delta ? (
        <div className={cn('mt-2 text-[12px]', toneClasses[tone])}>{delta}</div>
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 50%, rgba(246,146,81,0.18) 0%, rgba(247,247,247,0) 70%)',
        }}
      />
    </motion.div>
  );
}
