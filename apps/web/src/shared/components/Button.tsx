'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const base =
  'group relative inline-flex items-center justify-center gap-2 ' +
  'font-sans font-medium select-none ' +
  'rounded-[var(--radius-buttons)] ' +
  'transition-[background,color,box-shadow,transform] duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-carbon focus-visible:ring-offset-2 focus-visible:ring-offset-fog ' +
  'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  // Deep tangerine gradient + white text. The gradient is tuned so the
  // mid-tone clears WCAG AA (4.6:1) for white at button text size.
  primary: 'btn-primary-surface text-white',
  ghost:
    'btn-ghost-surface text-carbon border border-black/[0.04] dark:border-white/[0.14]',
  dark: 'bg-carbon text-white hover:bg-deep-slate',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] tracking-[-0.01em]',
  md: 'h-11 px-6 text-[14px] tracking-[-0.01em]',
  lg: 'h-12 px-7 text-[15px] tracking-[-0.01em]',
};

const motionProps = {
  whileHover: { y: -1 },
  whileTap: { y: 0, scale: 0.985 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
};

type ButtonProps = BaseProps &
  Omit<HTMLMotionProps<'button'>, 'children' | 'ref'> & {
    children: ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props,
  ref,
) {
  const {
    variant = 'primary',
    size = 'md',
    className,
    children,
    disabled,
    ...rest
  } = props;

  return (
    <motion.button
      ref={ref}
      {...motionProps}
      {...rest}
      disabled={disabled}
      className={cn(
        base,
        variants[variant as Variant],
        sizes[size as Size],
        className,
      )}
    >
      {children}
    </motion.button>
  );
});

interface LinkButtonProps extends BaseProps {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  /** Stretch to parent width (e.g. full-width CTA in a drawer) */
  fullWidth?: boolean;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  href,
  children,
  onClick,
  fullWidth,
}: LinkButtonProps) {
  return (
    <motion.span
      {...motionProps}
      className={cn('inline-flex', fullWidth && 'w-full')}
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      >
        {children}
      </Link>
    </motion.span>
  );
}
