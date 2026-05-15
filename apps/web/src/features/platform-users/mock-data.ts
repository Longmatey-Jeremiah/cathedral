import { UserRole, UserStatus } from '@/shared/lib/types';
import type { PlatformUser } from './types';

const day = 24 * 60 * 60 * 1000;

export const platformUsers: PlatformUser[] = [
  {
    id: 'pu-0',
    email: 'super@cathedral.app',
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    churchName: null,
    lastSignIn: new Date(Date.now() - 0.1 * day).toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'pu-1',
    email: 'daniel@gracecentral.org',
    firstName: 'Daniel',
    lastName: 'Aboagye',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    churchName: 'Grace Central',
    lastSignIn: new Date(Date.now() - 1 * day).toISOString(),
    createdAt: new Date('2024-01-12').toISOString(),
  },
  {
    id: 'pu-2',
    email: 'priscilla@mountainview.app',
    firstName: 'Priscilla',
    lastName: 'Adjei',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    churchName: 'Mountain View',
    lastSignIn: new Date(Date.now() - 3 * day).toISOString(),
    createdAt: new Date('2024-04-08').toISOString(),
  },
  {
    id: 'pu-3',
    email: 'felix@riversidechapel.org',
    firstName: 'Felix',
    lastName: 'Quaye',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    churchName: 'Riverside Chapel',
    lastSignIn: new Date(Date.now() - 7 * day).toISOString(),
    createdAt: new Date('2024-07-21').toISOString(),
  },
  {
    id: 'pu-4',
    email: 'newhope-admin@church.org',
    firstName: 'Esther',
    lastName: 'Boadu',
    role: UserRole.ADMIN,
    status: UserStatus.PENDING,
    churchName: 'New Hope Tema',
    lastSignIn: null,
    createdAt: new Date(Date.now() - 1 * day).toISOString(),
  },
];
