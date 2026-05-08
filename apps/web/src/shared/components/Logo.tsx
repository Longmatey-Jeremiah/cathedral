import { cn } from '../lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-[10px] bg-carbon text-white"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M12 2 13.6 8.4 20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Z" />
        </svg>
      </span>
      <span className="font-display text-[20px] tracking-[-0.02em] text-carbon">
        Cathedral
      </span>
    </div>
  );
}
