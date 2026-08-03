import { UserRole } from '@prisma/client';

export class AuthUserDto {
  id!: string;
  email!: string;
  firstName!: string | null;
  lastName!: string | null;
  role!: UserRole;
  churchId!: string | null;
}

/** POST /auth/login. */
export class LoginResultDto {
  accessToken!: string;
  refreshToken!: string;
  mustChangePassword!: boolean;
  user!: AuthUserDto;
}

/** POST /auth/refresh — rotated token pair. */
export class TokenPairDto {
  accessToken!: string;
  refreshToken!: string;
}

/** Item in GET /auth/sessions. */
export class SessionInfoDto {
  id!: string;
  userAgent!: string | null;
  ip!: string | null;
  createdAt!: Date;
  lastSeenAt!: Date;
  current!: boolean;
}
