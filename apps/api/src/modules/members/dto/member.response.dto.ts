import {
  MemberStatus,
  DepartmentRole,
  MaritalStatus,
  Sex,
} from '@prisma/client';

export class MemberDto {
  id!: string;
  userId?: string | null;
  churchId!: string;
  /** "Other Names" on the membership form. */
  firstName!: string;
  /** "Surname" on the membership form. */
  lastName!: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status!: MemberStatus;
  joinDate!: Date;

  // Membership registration form.
  sex?: Sex | null;
  dateOfBirth?: Date | null;
  placeOfBirth?: string | null;
  address?: string | null;
  placeOfResidence?: string | null;
  occupation?: string | null;
  placeOfWork?: string | null;
  society?: string | null;
  nextOfKin?: string | null;
  parentsName?: string | null;
  hometown?: string | null;
  maritalStatus?: MaritalStatus | null;
  spouseName?: string | null;
  spouseOccupation?: string | null;
  religiousDenomination?: string | null;
  childrenNames!: string[];
  declarationDate?: Date | null;

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
