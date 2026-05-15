import type { UserRole, UserStatus } from '@/shared/lib/types';

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
  churchName: string | null;
  lastSignIn: string | null;
  createdAt: string;
}
