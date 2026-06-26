import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]',
  {
    variants: {
      tone: {
        success:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning:
          'bg-tangerine-tag/15 text-tangerine-deep dark:text-tangerine-tag',
        info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
        danger: 'bg-destructive/15 text-destructive',
        neutral:
          'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

const dotByTone = {
  success: 'bg-emerald-500',
  warning: 'bg-tangerine-deep',
  info: 'bg-sky-500',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground',
} as const;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  const t = tone ?? 'neutral';
  return (
    <span className={cn(badgeVariants({ tone: t }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden
          className={cn('inline-block h-1.5 w-1.5 rounded-full', dotByTone[t])}
        />
      ) : null}
      {children}
    </span>
  );
}
