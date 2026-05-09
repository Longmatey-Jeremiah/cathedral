import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Editorial italic-serif accent for one or two words inside a display heading.
 * The serif italic against the geometric grotesque is the signature contrast
 * move — it slows the eye on the emphasized word without breaking the
 * single-accent color discipline.
 */
export function Emph({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn('italic-serif', className)}>{children}</span>;
}
