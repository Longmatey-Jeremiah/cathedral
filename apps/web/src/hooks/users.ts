'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  usersService,
  type UpdateNotificationPreferencesInput,
  type UserPage,
} from '@/services/users.service';
import type { ApiError } from '@/services/api';
import type { ListParams } from '@/shared/lib/list';
import type { UserRole, User } from '@/shared/lib/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...userKeys.lists(), params] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

export function useMe() {
  return useQuery<User, ApiError>({
    queryKey: userKeys.me(),
    queryFn: usersService.me,
  });
}

export function useUpdateMyNotificationPreferences(
  options?: UseMutationOptions<
    User,
    ApiError,
    UpdateNotificationPreferencesInput
  >,
) {
  const qc = useQueryClient();
  return useMutation<User, ApiError, UpdateNotificationPreferencesInput>({
    mutationFn: usersService.updateMyNotificationPreferences,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useUsers(params: ListParams = {}) {
  return useQuery<UserPage, ApiError>({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUserRole(
  id: string,
  options?: UseMutationOptions<User, ApiError, UserRole>,
) {
  const qc = useQueryClient();
  return useMutation<User, ApiError, UserRole>({
    mutationFn: (role) => usersService.updateRole(id, role),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}
