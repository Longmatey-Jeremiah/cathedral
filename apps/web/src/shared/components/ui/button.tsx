'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium select-none transition-[background,color,box-shadow,transform] duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          // Cathedral primary: tangerine gradient + glassy inset.
          'btn-primary-surface text-white rounded-[var(--radius-buttons)]',
        ghost:
          'btn-ghost-surface text-carbon border border-black/[0.04] dark:border-white/[0.14] rounded-[var(--radius-buttons)]',
        dark:
          'bg-carbon text-white hover:bg-deep-slate rounded-[var(--radius-buttons)]',
        outline:
          'border border-input bg-card hover:bg-accent hover:text-accent-foreground rounded-md',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md',
        soft:
          'bg-fog text-carbon hover:bg-fog/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] rounded-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md',
        link: 'text-foreground underline-offset-4 hover:underline rounded-md',
      },
      size: {
        sm: 'h-9 px-4 text-[13px] tracking-[-0.01em]',
        md: 'h-11 px-6 text-[14px] tracking-[-0.01em]',
        lg: 'h-12 px-7 text-[15px] tracking-[-0.01em]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, asChild = false, type, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

export { buttonVariants };
