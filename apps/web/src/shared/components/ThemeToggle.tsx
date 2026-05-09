'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { cn } from '../lib/cn';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-9 w-9 shrink-0 rounded-full border border-black/[0.06] bg-fog/90 dark:border-white/[0.12] dark:bg-white/[0.06]',
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={cn(
        'relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full',
        'border border-black/[0.06] bg-fog/90 text-carbon shadow-sm',
        'transition-[background,box-shadow,border-color,color] duration-300',
        'hover:border-black/[0.12] hover:bg-fog',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbon focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-canvas)]',
        'dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 40, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="inline-flex"
        >
          {isDark ? (
            <FiMoon size={17} strokeWidth={2} aria-hidden />
          ) : (
            <FiSun size={17} strokeWidth={2} aria-hidden />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
