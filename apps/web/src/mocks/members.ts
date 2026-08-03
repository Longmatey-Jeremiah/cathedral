import { UserRole } from '@/shared/lib/types';
import type { MemberListItem } from '@/types/members';

export const members: MemberListItem[] = [
  { id: '1', name: 'Daniel Aboagye', phone: '+233551000001', status: 'ACTIVE', departmentCount: 2 },
  { id: '2', name: 'Ama Boateng', phone: '+233551000002', status: 'ACTIVE', departmentCount: 1 },
  { id: '3', name: 'Kojo Asante', phone: '+233551000003', status: 'ACTIVE', departmentCount: 3 },
  { id: '4', name: 'Naana Mensah', phone: null, status: 'VISITOR', departmentCount: 0 },
  { id: '5', name: 'Yaw Owusu', phone: '+233551000005', status: 'INACTIVE', departmentCount: 1 },
  { id: '6', name: 'Akua Sarpong', phone: '+233551000006', status: 'ACTIVE', departmentCount: 2 },
];

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  FINANCE: 'Finance',
  DEPARTMENT_LEADER: 'Dept. leader',
  MEMBER_CARE: 'Member care',
  VIEWER: 'Viewer',
};
