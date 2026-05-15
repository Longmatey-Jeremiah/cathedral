'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'block min-h-[88px] w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/80',
          'transition-[border-color,box-shadow] duration-200',
          'hover:border-foreground/20 focus:border-ring focus:outline-none focus:shadow-[0_0_0_4px_rgba(0,0,0,0.04)]',
          'dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.07)]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          invalid &&
            'border-destructive hover:border-destructive focus:border-destructive focus:shadow-[0_0_0_4px_rgba(201,123,132,0.12)]',
          className,
        )}
        {...props}
      />
    );
  },
);
