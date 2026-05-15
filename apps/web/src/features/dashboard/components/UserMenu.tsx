'use client';

import Link from 'next/link';
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { useSignOut } from '@/features/auth/hooks';
import { Avatar } from '@/shared/components/admin/Avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/cn';
import type { UserRole } from '@/shared/lib/types';
import { roleDescriptions } from '../mock-data';

interface Props {
  name: string;
  email: string;
  role: UserRole;
}

export function UserMenu({ name, email, role }: Props) {
  const signOut = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-full border border-border bg-muted/90 px-1.5 py-1 pr-3',
            'transition hover:border-foreground/15 hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <Avatar name={name} tone="tangerine" size="sm" />
          <span className="hidden text-[12px] font-medium text-foreground sm:inline">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <div className="px-3 pb-2 pt-2">
          <div className="text-[13px] font-medium text-foreground">{name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{email}</div>
          <Badge tone="neutral" className="mt-2">
            {roleDescriptions[role]}
          </Badge>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="sr-only">Account</DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/profile" className="gap-2">
            <FiUser size={14} className="text-muted-foreground" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="gap-2">
            <FiSettings size={14} className="text-muted-foreground" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            signOut();
          }}
          className="gap-2"
        >
          <FiLogOut size={14} className="text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
