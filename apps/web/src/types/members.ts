export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'VISITOR';
export type DepartmentRole = 'MEMBER' | 'LEADER';

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
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: MemberStatus;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
  departments: MemberDepartment[];
}
