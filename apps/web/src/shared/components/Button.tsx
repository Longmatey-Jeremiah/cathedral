'use client';

import Link from 'next/link';
import { forwardRef, type ReactNode } from 'react';
import { Button as UiButton, type ButtonProps as UiButtonProps } from './ui/button';
import { cn } from '../lib/cn';

/**
 * Legacy `Button` / `LinkButton` shim used by the marketing landing.
 *
 * The dashboard imports `Button` directly from `./ui/button`. This file
 * preserves the older `variant="primary"` API and adds a `LinkButton`
 * wrapper so existing landing pages (`Hero`, `Nav`, `Pricing`, `CtaBand`)
 * keep working without per-call edits.
 */
type LegacyVariant = 'primary' | 'ghost' | 'dark';
type LegacyButtonProps = Omit<UiButtonProps, 'variant'> & {
  variant?: LegacyVariant;
};

const mapVariant = (v: LegacyVariant): UiButtonProps['variant'] =>
  v === 'primary' ? 'default' : v;

export const Button = forwardRef<HTMLButtonElement, LegacyButtonProps>(
  function Button({ variant = 'primary', ...rest }, ref) {
    return <UiButton ref={ref} variant={mapVariant(variant)} {...rest} />;
  },
);

interface LinkButtonProps {
  href: string;
  variant?: LegacyVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick,
  fullWidth,
}: LinkButtonProps) {
  return (
    <UiButton
      asChild
      variant={mapVariant(variant)}
      size={size}
      className={cn(fullWidth && 'w-full', className)}
    >
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </UiButton>
  );
}
