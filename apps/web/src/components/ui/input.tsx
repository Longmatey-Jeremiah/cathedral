'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const base =
  'block w-full text-[15px] text-foreground placeholder:text-muted-foreground/80 ' +
  'transition-[border-color,background-color,box-shadow] duration-200 ' +
  'focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';

const framed =
  'h-11 rounded-md border border-input bg-card px-3.5 ' +
  'shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:shadow-none ' +
  'hover:border-foreground/20 ' +
  'focus:border-ring focus:shadow-[0_0_0_4px_rgba(0,0,0,0.04)] ' +
  'dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.07)]';

const invalidFramed =
  'border-destructive hover:border-destructive focus:border-destructive ' +
  'focus:shadow-[0_0_0_4px_rgba(201,123,132,0.12)] ' +
  'dark:focus:shadow-[0_0_0_4px_rgba(201,123,132,0.22)]';

/**
 * Form input — single visual flavor (framed) that lives across login,
 * settings, and admin forms. Compose with `<InputGroup>` for icon adornments.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, type, ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type ?? 'text'}
        aria-invalid={invalid || undefined}
        className={cn(base, framed, invalid && invalidFramed, className)}
        {...props}
      />
    );
  },
);

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

/**
 * Wraps an `Input` and adds leading / trailing slots. The underlying input
 * should pass `className="h-11 flex-1 border-0 bg-transparent p-0 focus:ring-0"`.
 */
export function InputGroup({
  className,
  invalid,
  startAdornment,
  endAdornment,
  children,
  ...rest
}: InputGroupProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-input bg-card px-3.5',
        'transition-[border-color,box-shadow] duration-200',
        'has-[:focus]:border-ring has-[:focus]:shadow-[0_0_0_4px_rgba(0,0,0,0.04)]',
        'dark:has-[:focus]:shadow-[0_0_0_4px_rgba(255,255,255,0.07)]',
        'hover:border-foreground/20',
        invalid && invalidFramed,
        className,
      )}
      {...rest}
    >
      {startAdornment ? (
        <span className="text-muted-foreground">{startAdornment}</span>
      ) : null}
      {children}
      {endAdornment ? (
        <span className="text-muted-foreground">{endAdornment}</span>
      ) : null}
    </div>
  );
}
