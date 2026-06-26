import type { Member } from '@/types/members';
import { api } from '@/services/api';
import type { UserRole, UserStatus } from '@/shared/lib/types';

/** Raw user as returned by the API (`PublicUser` — User without password). */
interface ApiUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
  churchId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface UpdateMemberInput {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}

// Members are `users` on the API. Map to the UI's Member shape — the API has
// no `department`, and exposes the join date as `createdAt`.
function toMember(u: ApiUser): Member {
  return {
    id: u.id,
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    email: u.email,
    role: u.role,
    status: u.status,
    joinedAt: u.createdAt,
  };
}

export const membersService = {
  list: () => api.get<ApiUser[]>('/users').then((rows) => rows.map(toMember)),
  get: (id: string) => api.get<ApiUser>(`/users/${id}`).then(toMember),
  create: (input: CreateMemberInput) =>
    api.post<ApiUser>('/users', input).then(toMember),
  update: (id: string, input: UpdateMemberInput) =>
    api.patch<ApiUser>(`/users/${id}`, input).then(toMember),
};
