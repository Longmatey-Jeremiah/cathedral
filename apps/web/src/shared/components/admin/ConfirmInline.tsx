'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props {
  /** What renders in the resting state (typically an icon button). */
  children: (open: () => void) => ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  className?: string;
}

/**
 * Two-step inline confirmation. In the resting state the consumer renders its
 * own trigger via the `children` render-prop and calls `open()` to flip into
 * the confirm state, where Cancel and Confirm appear side-by-side. Used in
 * tables and danger-zone cards instead of a `confirm()` dialog.
 */
export function ConfirmInline({
  children,
  confirmLabel = 'Confirm delete',
  cancelLabel = 'Cancel',
  pending = false,
  onConfirm,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!open) return <>{children(() => setOpen(true))}</>;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => setOpen(false)}
        disabled={pending}
        className="text-[12px] text-stone hover:text-carbon disabled:opacity-60"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        className={cn(
          'rounded-[var(--radius-badges)] bg-dusty-rose/10 px-2.5 py-1 text-[11px] font-medium text-dusty-rose',
          'transition-colors hover:bg-dusty-rose/15 disabled:opacity-60',
        )}
      >
        {pending ? 'Working…' : confirmLabel}
      </button>
    </div>
  );
}
