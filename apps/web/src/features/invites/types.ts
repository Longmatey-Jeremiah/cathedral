import type { UserRole } from '@/shared/lib/types';

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}
