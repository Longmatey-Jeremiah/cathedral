export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'VISITOR';
export type DepartmentRole = 'MEMBER' | 'LEADER';
export type Sex = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED';

/** Slim row the members table renders — no full department objects. */
export interface MemberListItem {
  id: string;
  name: string;
  phone: string | null;
  status: MemberStatus;
  departmentCount: number;
}

export interface MemberDepartment {
  departmentId: string;
  name: string;
  role: DepartmentRole;
}

/** Full member profile (detail endpoint). Distinct from the auth User. */
export interface Member {
  id: string;
  userId: string | null;
  /** "Other Names" on the membership form. */
  firstName: string;
  /** "Surname" on the membership form. */
  lastName: string;
  /** "Tel. No." on the membership form. */
  phone: string | null;
  avatarUrl: string | null;
  status: MemberStatus;
  joinDate: string;

  // Membership registration form — all filled in later, so all nullable.
  sex: Sex | null;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  address: string | null;
  placeOfResidence: string | null;
  occupation: string | null;
  placeOfWork: string | null;
  society: string | null;
  nextOfKin: string | null;
  parentsName: string | null;
  hometown: string | null;
  maritalStatus: MaritalStatus | null;
  spouseName: string | null;
  spouseOccupation: string | null;
  religiousDenomination: string | null;
  childrenNames: string[];
  declarationDate: string | null;

  createdAt: string;
  updatedAt: string;
  departments: MemberDepartment[];
}
