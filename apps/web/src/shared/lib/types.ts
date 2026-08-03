// Domain types mirroring the API's Prisma enums and DTOs.
// Kept hand-written (not generated) so the web app does not depend on the API
// build output — this is the contract between the two services.

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  FINANCE: 'FINANCE',
  DEPARTMENT_LEADER: 'DEPARTMENT_LEADER',
  MEMBER_CARE: 'MEMBER_CARE',
  VIEWER: 'VIEWER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Human-readable role names for menus and profile blurbs. */
export const roleDescriptions: Record<UserRole, string> = {
  SUPER_ADMIN: 'Platform operator',
  ADMIN: 'Church administrator',
  FINANCE: 'Finance team',
  DEPARTMENT_LEADER: 'Department leader',
  MEMBER_CARE: 'Pastoral care',
  VIEWER: 'Read-only',
};

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  churchId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** What `/auth/login` returns. */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  user: Pick<
    User,
    'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'churchId'
  >;
}

/** Shape produced by the API's HttpExceptionFilter. */
export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
}
