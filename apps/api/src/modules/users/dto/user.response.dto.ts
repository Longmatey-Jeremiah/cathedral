import { UserRole, UserStatus } from '@prisma/client';

/** Public user shape — the password hash is never serialized. */
export class UserDto {
  id!: string;
  email!: string;
  firstName?: string | null;
  lastName?: string | null;
  role!: UserRole;
  status!: UserStatus;
  mustChangePassword!: boolean;
  churchId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
