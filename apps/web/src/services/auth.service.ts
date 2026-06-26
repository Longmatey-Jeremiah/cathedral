import { api } from '@/services/api';
import type { LoginResponse, UserRole } from '@/shared/lib/types';
import type {
  AcceptInviteInput,
  ChangePasswordInput,
  LoginInput,
} from '@/shared/lib/rules/auth';

export interface InviteDetails {
  email: string;
  role: UserRole;
  churchId: string | null;
}

export const authService = {
  login: (input: LoginInput) =>
    api.post<LoginResponse>('/auth/login', input, { anonymous: true }),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
      { anonymous: true },
    ),

  changePassword: (input: Omit<ChangePasswordInput, 'confirmPassword'>) =>
    api.post<{ success: true }>('/auth/change-password', input),

  validateInvite: (token: string) =>
    api.get<InviteDetails>(
      `/users/invite/validate?token=${encodeURIComponent(token)}`,
      { anonymous: true },
    ),

  acceptInvite: (input: AcceptInviteInput & { token: string }) =>
    api.post<{ id: string }>('/auth/accept-invite', input, { anonymous: true }),
};
