import { Avatar as UiAvatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/cn';

type Tone = 'fog' | 'tangerine';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  /** Source name — initials are derived from the first two whitespace-split parts. */
  name: string;
  tone?: Tone;
  size?: Size;
  className?: string;
}

const fallbackByTone: Record<Tone, string> = {
  fog: 'bg-muted text-foreground',
  tangerine:
    'bg-tangerine-tag/15 text-tangerine-deep dark:bg-tangerine-tag/20 dark:text-tangerine-tag',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 w-7 text-[11px] rounded-[8px]',
  md: 'h-9 w-9 text-[13px] rounded-[10px]',
  lg: 'h-11 w-11 text-[15px] rounded-[12px]',
};

/** Initials chip — used in tables, sidebars, and menus. */
export function Avatar({ name, tone = 'fog', size = 'md', className }: Props) {
  return (
    <UiAvatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className={cn(fallbackByTone[tone])}>
        {initials(name)}
      </AvatarFallback>
    </UiAvatar>
  );
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || '·'
  );
}
