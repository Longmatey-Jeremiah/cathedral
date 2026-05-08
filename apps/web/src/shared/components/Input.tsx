import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type Variant = 'bare' | 'framed';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /**
   * 'bare' — hero email-capture style (transparent, single bottom border, 0 radius).
   * 'framed' — denser form style for sign-in / settings (soft border, 8px radius, 44px height).
   * Both stay within style.md's "0px or minimal radius" rule.
   */
  variant?: Variant;
  /** Optional leading icon for the framed variant. */
  startAdornment?: React.ReactNode;
}

const baseShared =
  'block w-full text-[15px] text-carbon placeholder:text-pebble ' +
  'dark:placeholder:text-stone ' +
  'transition-[border-color,background-color,box-shadow] duration-200 ' +
  'focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';

const bare =
  'bg-transparent border-0 border-b border-carbon/80 rounded-[var(--radius-inputs)] ' +
  'px-1 py-3 focus:border-carbon ' +
  'dark:border-white/45 dark:focus:border-[var(--color-carbon)]';

const framed =
  'bg-snow border border-black/[0.08] rounded-[var(--radius-small)] ' +
  'h-11 px-3.5 ' +
  'shadow-[0_1px_0_rgba(0,0,0,0.02)] ' +
  'hover:border-black/[0.16] ' +
  'focus:border-carbon focus:shadow-[0_0_0_4px_rgba(0,0,0,0.04)] ' +
  'dark:border-white/[0.14] dark:bg-[var(--color-snow)] dark:shadow-none ' +
  'dark:hover:border-white/25 dark:focus:border-[var(--color-carbon)] ' +
  'dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.07)]';

const invalidBare = 'border-dusty-rose focus:border-dusty-rose';
const invalidFramed =
  'border-dusty-rose hover:border-dusty-rose focus:border-dusty-rose ' +
  'focus:shadow-[0_0_0_4px_rgba(201,123,132,0.12)] ' +
  'dark:focus:shadow-[0_0_0_4px_rgba(201,123,132,0.22)]';

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, invalid, variant = 'bare', startAdornment, ...rest },
  ref,
) {
  if (variant === 'framed' && startAdornment) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 bg-snow rounded-[var(--radius-small)] border border-black/[0.08] px-3.5',
          'dark:border-white/[0.14] dark:bg-[var(--color-snow)]',
          'transition-[border-color,box-shadow] duration-200',
          'has-[:focus]:border-carbon has-[:focus]:shadow-[0_0_0_4px_rgba(0,0,0,0.04)]',
          'dark:has-[:focus]:border-[var(--color-carbon)] dark:has-[:focus]:shadow-[0_0_0_4px_rgba(255,255,255,0.07)]',
          'hover:border-black/[0.16] dark:hover:border-white/25',
          invalid && invalidFramed,
        )}
      >
        <span className="text-stone">{startAdornment}</span>
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            baseShared,
            'h-11 flex-1 border-0 bg-transparent p-0 focus:ring-0',
            className,
          )}
          {...rest}
        />
      </div>
    );
  }

  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        baseShared,
        variant === 'bare' ? bare : framed,
        invalid && (variant === 'bare' ? invalidBare : invalidFramed),
        className,
      )}
      {...rest}
    />
  );
});
