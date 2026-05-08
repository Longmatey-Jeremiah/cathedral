import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  churchId: string | null;
}

export const isSuperAdmin = (user: { role: UserRole }) =>
  user.role === UserRole.SUPER_ADMIN;
