import type { UserRole, UserStatus } from '@/shared/lib/types';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  joinedAt: string;
}
