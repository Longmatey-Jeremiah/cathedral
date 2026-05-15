import { cn } from '@/shared/lib/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted dark:bg-white/[0.06]',
        className,
      )}
      {...props}
    />
  );
}
