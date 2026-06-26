'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import { Logo } from '@/components/Logo';
import { cn } from '@/shared/lib/cn';
import type { UserRole } from '@/shared/lib/types';
import { navGroups, visibleNav, type NavItem } from './nav';
import { churchContext, roleDescriptions } from '@/mocks/dashboard';

interface Props {
  role: UserRole;
  userLabel: string;
  email: string;
  /** Mobile drawer state — ignored on lg+ where the sidebar is always shown. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ role, userLabel, email, open, onClose }: Props) {
  const groups = useMemo(() => visibleNav(navGroups, role), [role]);
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop — mobile only, closes the drawer on tap */}
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] shrink-0 flex-col border-r border-black/[0.05] bg-snow transition-transform duration-200 ease-out',
          'dark:border-white/[0.06]',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:sticky lg:top-0 lg:z-auto lg:translate-x-0',
        )}
      >
      <div className="relative px-6 pt-6 pb-4">
        <Link href="/dashboard" className="inline-flex" onClick={onClose}>
          <Logo />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-4 top-5 grid h-8 w-8 place-items-center rounded-full text-stone transition hover:bg-fog hover:text-carbon lg:hidden dark:hover:bg-white/[0.06]"
        >
          <FiX size={18} aria-hidden />
        </button>

        {/* Tenant pill — visible context that this dashboard is scoped to a church */}
        <div className="mt-5 rounded-[var(--radius-cardinner)] bg-fog px-3 py-2 dark:bg-white/[0.04]">
          <div className="text-[10px] uppercase tracking-[0.08em] text-pebble">
            Tenant
          </div>
          <div className="mt-0.5 truncate text-[13px] font-medium text-carbon">
            {role === 'SUPER_ADMIN' ? 'All churches' : churchContext.name}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.1em] text-pebble">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  onNavigate={onClose}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-black/[0.05] p-4 dark:border-white/[0.06]">
        <div className="flex items-center gap-3 rounded-[var(--radius-cardinner)] px-2 py-2">
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tangerine-tag/15 font-display text-[13px] text-tangerine-deep dark:bg-tangerine-tag/20 dark:text-tangerine-tag"
          >
            {initials(userLabel)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[13px] font-medium text-carbon">
              {userLabel}
            </div>
            <div className="truncate text-[11px] text-stone">
              {roleDescriptions[role]} · {email}
            </div>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'group relative flex items-center gap-3 rounded-[var(--radius-cardinner)] px-3 py-2',
          'text-[13px] transition-colors',
          active
            ? 'bg-fog text-carbon dark:bg-white/[0.06]'
            : 'text-stone hover:bg-fog/60 hover:text-carbon dark:hover:bg-white/[0.04]',
        )}
      >
        {active ? (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-tangerine-tag"
          />
        ) : null}
        <Icon
          size={16}
          className={cn(
            'shrink-0',
            active ? 'text-carbon' : 'text-pebble group-hover:text-stone',
          )}
        />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('') || 'U';
}
