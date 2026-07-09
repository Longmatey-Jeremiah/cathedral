import type { UserRole, User } from '@/shared/lib/types';
import { api } from '@/services/api';
import { listQuery, type ListParams, type Paginated } from '@/shared/lib/list';

export type UserPage = Paginated<User>;

// The API scopes GET /users to the actor's church (super admins see all), so no
// churchId param is needed here.
export const usersService = {
  list: (params?: ListParams): Promise<UserPage> =>
    api.get<UserPage>(`/users?${listQuery(params)}`),
  updateRole: (id: string, role: UserRole) =>
    api.patch<User>(`/users/${id}`, { role }),
};
