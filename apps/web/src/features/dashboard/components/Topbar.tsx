'use client';

import { FiBell, FiSearch } from 'react-icons/fi';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { cn } from '@/shared/lib/cn';
import type { UserRole } from '@/shared/lib/types';
import { UserMenu } from './UserMenu';

interface Props {
  name: string;
  email: string;
  role: UserRole;
}

export function Topbar({ name, email, role }: Props) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/[0.05] bg-page-canvas/85 px-6 backdrop-blur',
        'dark:border-white/[0.06]',
      )}
    >
      {/* Search — design-only for now; will wire to Cmd-K palette */}
      <label
        className={cn(
          'group relative flex h-9 max-w-md flex-1 items-center gap-2 rounded-full border border-black/[0.06] bg-fog/90 px-3',
          'transition focus-within:border-black/[0.12] hover:border-black/[0.12]',
          'dark:border-white/[0.12] dark:bg-white/[0.06]',
        )}
      >
        <FiSearch size={14} className="shrink-0 text-pebble" aria-hidden />
        <input
          type="search"
          placeholder="Search members, funds, departments…"
          className="w-full bg-transparent text-[13px] text-carbon placeholder:text-pebble focus:outline-none"
        />
        <kbd
          className={cn(
            'hidden shrink-0 items-center gap-0.5 rounded-md border border-black/[0.06] bg-snow px-1.5 py-0.5 text-[10px] text-pebble sm:inline-flex',
            'dark:border-white/[0.08] dark:bg-white/[0.04]',
          )}
        >
          ⌘K
        </kbd>
      </label>

      <button
        type="button"
        aria-label="Notifications"
        className={cn(
          'relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/[0.06] bg-fog/90 text-carbon',
          'transition hover:border-black/[0.12] hover:bg-fog',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbon focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-canvas)]',
          'dark:border-white/[0.12] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]',
        )}
      >
        <FiBell size={16} aria-hidden />
        <span
          aria-hidden
          className="absolute right-2 top-2 inline-block h-1.5 w-1.5 rounded-full bg-tangerine-tag"
        />
      </button>

      <ThemeToggle />

      <UserMenu name={name} email={email} role={role} />
    </header>
  );
}
