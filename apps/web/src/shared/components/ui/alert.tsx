import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/shared/lib/cn';

const alertVariants = cva(
  'relative w-full rounded-[var(--radius-cardinner)] border px-4 py-3 text-[13px] leading-[1.5] grid grid-cols-[auto_1fr] items-start gap-3',
  {
    variants: {
      tone: {
        info: 'border-border bg-muted text-foreground',
        error:
          'border-destructive/40 bg-destructive/5 text-foreground',
        warning:
          'border-tangerine-deep/30 bg-tangerine-tag/10 text-foreground',
        success:
          'border-emerald-500/30 bg-emerald-500/5 text-foreground',
      },
    },
    defaultVariants: {
      tone: 'error',
    },
  },
);

const dotByTone = {
  info: 'bg-muted-foreground',
  error: 'bg-destructive',
  warning: 'bg-tangerine-deep',
  success: 'bg-emerald-500',
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, tone, role: roleProp, children, ...props },
  ref,
) {
  const t = tone ?? 'error';
  const role = roleProp ?? (t === 'error' ? 'alert' : 'status');
  return (
    <div
      ref={ref}
      role={role}
      className={cn(alertVariants({ tone: t }), className)}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full',
          dotByTone[t],
        )}
      />
      <div>{children}</div>
    </div>
  );
});

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function AlertTitle({ className, ...props }, ref) {
  return (
    <h5
      ref={ref}
      className={cn('mb-0.5 font-medium tracking-tight', className)}
      {...props}
    />
  );
});

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function AlertDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn('text-[13px] leading-[1.5] text-muted-foreground', className)}
      {...props}
    />
  );
});
