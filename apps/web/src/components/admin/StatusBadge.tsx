import type { ReactNode } from 'react';
import { Badge, type BadgeProps } from '../ui/badge';

export type BadgeTone = NonNullable<BadgeProps['tone']>;

interface Props {
  tone?: BadgeTone;
  /** Show a colored dot before the label. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Re-export of the shadcn `Badge` with explicit tone naming. The tones map
 * across the dashboard: success (active), warning (pending), info, danger,
 * neutral.
 */
export function StatusBadge({ tone = 'neutral', dot, children, className }: Props) {
  return (
    <Badge tone={tone} dot={dot} className={className}>
      {children}
    </Badge>
  );
}
