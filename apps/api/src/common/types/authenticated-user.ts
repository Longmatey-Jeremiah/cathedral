import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  churchId: string | null;
  /** The login session this access token belongs to, when present. */
  sessionId?: string;
}

export const isSuperAdmin = (user: { role: UserRole }) =>
  user.role === UserRole.SUPER_ADMIN;
