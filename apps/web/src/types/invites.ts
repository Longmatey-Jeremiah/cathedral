import type { UserRole } from '@/shared/lib/types';

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  used: boolean;
  createdAt: string;
  churchId?: string | null;
  inviteUrl?: string | null;
}

export function inviteStatus(invite: Invite): 'used' | 'expired' | 'pending' {
  if (invite.used) return 'used';
  if (new Date(invite.expiresAt).getTime() < Date.now()) return 'expired';
  return 'pending';
}
