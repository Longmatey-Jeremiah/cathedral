import { api } from '@/shared/lib/api';
import type { LoginResponse } from '@/shared/lib/types';
import type { ChangePasswordInput, LoginInput } from './schemas';

export const authApi = {
  login: (input: LoginInput) =>
    api.post<LoginResponse>('/auth/login', input, { anonymous: true }),

  changePassword: (input: Omit<ChangePasswordInput, 'confirmPassword'>) =>
    api.post<{ success: true }>('/auth/change-password', input),
};
