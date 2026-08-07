import type { NotificationChannel, UserRole, User } from '@/shared/lib/types';
import { api } from '@/services/api';
import { listQuery, type ListParams, type Paginated } from '@/shared/lib/list';

export type UserPage = Paginated<User>;

export interface UpdateNotificationPreferencesInput {
  phone?: string;
  notifyVia?: NotificationChannel;
}

// The API scopes GET /users to the actor's church (super admins see all), so no
// churchId param is needed here.
export const usersService = {
  list: (params?: ListParams): Promise<UserPage> =>
    api.get<UserPage>(`/users?${listQuery(params)}`),
  updateRole: (id: string, role: UserRole) =>
    api.patch<User>(`/users/${id}`, { role }),
  me: (): Promise<User> => api.get<User>('/users/me'),
  updateMyNotificationPreferences: (
    input: UpdateNotificationPreferencesInput,
  ): Promise<User> =>
    api.patch<User>('/users/me/notification-preferences', input),
};
