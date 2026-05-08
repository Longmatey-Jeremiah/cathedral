import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface Props {
  tone?: 'error' | 'info';
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'error', children, className }: Props) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-cardinner)] border px-4 py-3 text-[13px] leading-[1.5]',
        tone === 'error'
          ? 'border-dusty-rose/40 bg-dusty-rose/5 text-midnight-ink dark:text-carbon'
          : 'border-black/[0.06] bg-fog text-graphite dark:border-white/[0.1]',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full',
          tone === 'error' ? 'bg-dusty-rose' : 'bg-stone',
        )}
      />
      <div>{children}</div>
    </div>
  );
}
