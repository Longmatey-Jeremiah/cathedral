import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface Props {
  children: ReactNode;
  className?: string;
  variant?: 'fog' | 'snow';
}

export function Pill({ children, className, variant = 'fog' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 text-[12px] font-medium tracking-[-0.01em]',
        'rounded-[var(--radius-badges)] text-graphite',
        variant === 'fog' ? 'bg-fog' : 'bg-snow',
        'border border-black/[0.04] dark:border-white/[0.08]',
        variant === 'snow' && 'dark:bg-white/[0.06]',
        className,
      )}
    >
      {children}
    </span>
  );
}
