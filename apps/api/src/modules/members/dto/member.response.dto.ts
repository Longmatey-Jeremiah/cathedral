import { MemberStatus, DepartmentRole } from '@prisma/client';

export class MemberDto {
  id!: string;
  userId?: string | null;
  churchId!: string;
  firstName!: string;
  lastName!: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status!: MemberStatus;
  joinDate!: Date;
  deletedAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}

/** Row shape for GET /members — trimmed for the table view. */
export class MemberListItemDto {
  id!: string;
  name!: string;
  phone!: string | null;
  status!: MemberStatus;
  departmentCount!: number;
}

export class MemberDepartmentDto {
  departmentId!: string;
  name!: string;
  role!: DepartmentRole;
}

/** GET /members/:id — full member plus their department assignments. */
export class MemberDetailDto extends MemberDto {
  departments!: MemberDepartmentDto[];
}
