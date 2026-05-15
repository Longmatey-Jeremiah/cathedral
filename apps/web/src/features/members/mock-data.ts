import { UserRole, UserStatus } from '@/shared/lib/types';
import type { Member } from './types';

export const members: Member[] = [
  {
    id: '1',
    firstName: 'Daniel',
    lastName: 'Aboagye',
    email: 'daniel@gracecentral.org',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    department: 'Pastoral',
    joinedAt: '2024-01-12',
  },
  {
    id: '2',
    firstName: 'Ama',
    lastName: 'Boateng',
    email: 'ama.b@gracecentral.org',
    role: UserRole.FINANCE,
    status: UserStatus.ACTIVE,
    department: 'Finance',
    joinedAt: '2024-02-04',
  },
  {
    id: '3',
    firstName: 'Kojo',
    lastName: 'Asante',
    email: 'kojo.a@gracecentral.org',
    role: UserRole.DEPARTMENT_LEADER,
    status: UserStatus.ACTIVE,
    department: 'Children',
    joinedAt: '2024-03-21',
  },
  {
    id: '4',
    firstName: 'Naana',
    lastName: 'Mensah',
    email: 'naana.m@gracecentral.org',
    role: UserRole.DEPARTMENT_LEADER,
    status: UserStatus.PENDING,
    department: 'Worship',
    joinedAt: '2026-05-02',
  },
  {
    id: '5',
    firstName: 'Yaw',
    lastName: 'Owusu',
    email: 'yaw.o@gracecentral.org',
    role: UserRole.VIEWER,
    status: UserStatus.ACTIVE,
    department: 'Audit',
    joinedAt: '2024-09-30',
  },
  {
    id: '6',
    firstName: 'Akua',
    lastName: 'Sarpong',
    email: 'akua.s@gracecentral.org',
    role: UserRole.DEPARTMENT_LEADER,
    status: UserStatus.ACTIVE,
    department: 'Hospitality',
    joinedAt: '2025-01-09',
  },
];

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  FINANCE: 'Finance',
  DEPARTMENT_LEADER: 'Dept. leader',
  VIEWER: 'Viewer',
};
