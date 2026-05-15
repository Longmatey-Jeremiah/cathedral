import { cn } from '../../lib/cn';

interface Props {
  /** 0 - 100. Values outside the range are clamped. */
  value: number;
  /** Optional label drawn above the bar. */
  label?: string;
  /** Optional value drawn above the bar (right-aligned). */
  trailing?: string;
  /** Color of the filled portion. */
  tone?: 'carbon' | 'tangerine' | 'emerald';
  className?: string;
}

const fillByTone: Record<NonNullable<Props['tone']>, string> = {
  carbon: 'bg-carbon',
  tangerine: 'bg-tangerine-deep',
  emerald: 'bg-emerald-500',
};

/** Hairline progress bar — used for fund allocations, capacity gauges, etc. */
export function ProgressBar({
  value,
  label,
  trailing,
  tone = 'carbon',
  className,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {label || trailing ? (
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="text-graphite">{label}</span>
          <span className="text-stone">{trailing}</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-fog dark:bg-white/[0.06]"
      >
        <div
          className={cn('h-full transition-[width]', fillByTone[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
