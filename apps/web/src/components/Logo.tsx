import { cn } from '@/shared/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        aria-hidden
        viewBox="0 0 100 104"
        className="h-8 w-8 text-carbon"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g stroke="currentColor">
          <path d="M12 99 L88 99" strokeWidth="2.8" />
          <path d="M16 99 L16 46 Q16 12 50 6 Q84 12 84 46 L84 99" strokeWidth="2.8" />
          <path d="M26 99 L26 70 Q26 63 30 61 Q34 63 34 70 L34 99" strokeWidth="2.1" />
          <path d="M45.5 99 L45.5 60 Q45.5 51 50 48 Q54.5 51 54.5 60 L54.5 99" strokeWidth="2.1" />
          <path d="M66 99 L66 70 Q66 63 70 61 Q74 63 74 70 L74 99" strokeWidth="2.1" />
        </g>
        <g stroke="#B08A4A" strokeWidth="2.1">
          <circle cx="50" cy="32" r="11" />
          <circle cx="50" cy="32" r="3.8" />
          <path d="M50 21 L50 43 M39 32 L61 32 M42.2 24.2 L57.8 39.8 M42.2 39.8 L57.8 24.2" />
        </g>
      </svg>
      <span className="font-display text-[20px] tracking-[-0.02em] text-carbon">
        Cathedral
      </span>
    </div>
  );
}
