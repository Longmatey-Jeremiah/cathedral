import { UserRole } from '@/shared/lib/types';
import type { Invite } from './types';

const day = 24 * 60 * 60 * 1000;

export const invites: Invite[] = [
  {
    id: 'i-1',
    email: 'kwesi@church.org',
    role: UserRole.DEPARTMENT_LEADER,
    used: false,
    createdAt: new Date(Date.now() - 2 * day).toISOString(),
    expiresAt: new Date(Date.now() + 1 * day).toISOString(),
  },
  {
    id: 'i-2',
    email: 'esi@church.org',
    role: UserRole.FINANCE,
    used: false,
    createdAt: new Date(Date.now() - 1 * day).toISOString(),
    expiresAt: new Date(Date.now() + 2 * day).toISOString(),
  },
  {
    id: 'i-3',
    email: 'kojo@church.org',
    role: UserRole.VIEWER,
    used: true,
    createdAt: new Date(Date.now() - 5 * day).toISOString(),
    expiresAt: new Date(Date.now() - 2 * day).toISOString(),
  },
  {
    id: 'i-4',
    email: 'amanda@church.org',
    role: UserRole.ADMIN,
    used: false,
    createdAt: new Date(Date.now() - 3 * day).toISOString(),
    expiresAt: new Date(Date.now() + 4 * day).toISOString(),
  },
];

/** Friendly relative-time formatter for "expires in 2 days" / "expired 1 day ago". */
export function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const sign = ms >= 0 ? '' : '-';
  const days = Math.round(Math.abs(ms) / day);
  if (days === 0) {
    return ms >= 0 ? 'today' : 'today';
  }
  return `${sign}${days}d`;
}

export function inviteStatus(invite: Invite): 'used' | 'expired' | 'pending' {
  if (invite.used) return 'used';
  if (new Date(invite.expiresAt).getTime() < Date.now()) return 'expired';
  return 'pending';
}
