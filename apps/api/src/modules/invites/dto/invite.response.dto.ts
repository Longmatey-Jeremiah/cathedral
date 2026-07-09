import { UserRole } from '@prisma/client';

/** POST /users/invite. */
export class InviteResultDto {
  email!: string;
  expiresAt!: Date;
  inviteUrl!: string;
}

/** Item in GET /users/invite/list. */
export class InviteListItemDto {
  id!: string;
  email!: string;
  role!: UserRole;
  expiresAt!: Date;
  used!: boolean;
  createdAt!: Date;
  churchId?: string | null;
  inviteUrl!: string | null;
}

/** GET /users/invite/validate — invite details for the accept form. */
export class InviteValidationDto {
  email!: string;
  role!: UserRole;
  churchId!: string | null;
}
