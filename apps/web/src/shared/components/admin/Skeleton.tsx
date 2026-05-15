import { Skeleton as UiSkeleton } from '../ui/skeleton';
import { cn } from '../../lib/cn';

export const Skeleton = UiSkeleton;

/**
 * Full-card list skeleton — mirrors the shape of `DataTable` so the swap from
 * loading → loaded does not jump the layout.
 */
export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-cards)] border border-border bg-card shadow-card',
      )}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-0"
        >
          <Skeleton className="h-9 w-9 rounded-[10px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Form-shaped skeleton for detail pages while a single record loads. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-[var(--radius-cards)] border border-border bg-card p-8 shadow-card">
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
