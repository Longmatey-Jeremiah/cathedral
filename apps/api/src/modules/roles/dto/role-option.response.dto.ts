import { UserRole } from '@prisma/client';

export class RoleOptionDto {
  value!: UserRole;
  label!: string;
}
