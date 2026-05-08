'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface Props {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  /** Hide label visually but keep it for screen readers. */
  srOnlyLabel?: boolean;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
  srOnlyLabel,
}: Props) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          'text-[12px] font-medium uppercase tracking-[0.12em] text-pebble dark:text-stone',
          srOnlyLabel && 'sr-only',
        )}
      >
        {label}
      </label>

      <div
        aria-describedby={
          [errorId, hintId].filter(Boolean).join(' ') || undefined
        }
      >
        {children}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden text-[12px] text-dusty-rose"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            id={hintId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-[12px] text-stone"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
