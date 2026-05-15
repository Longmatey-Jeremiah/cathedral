'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { FiSearch } from 'react-icons/fi';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  /** Right-side slot (filter chips, sort menu, etc.). */
  children?: ReactNode;
  className?: string;
}

/** Pill-shaped search input with an optional trailing slot for chips/menus. */
export function FilterBar({
  query,
  onQueryChange,
  placeholder = 'Search…',
  children,
  className,
}: Props) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn('flex flex-wrap items-center gap-3', className)}
    >
      <label
        className={cn(
          'relative flex h-10 max-w-md flex-1 items-center gap-2 rounded-full border border-black/[0.06] bg-snow px-3.5',
          'transition focus-within:border-black/[0.16] hover:border-black/[0.16]',
          'dark:border-white/[0.08]',
        )}
      >
        <FiSearch size={14} className="shrink-0 text-pebble" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13px] text-carbon placeholder:text-pebble focus:outline-none"
        />
      </label>
      {children}
    </motion.div>
  );
}
