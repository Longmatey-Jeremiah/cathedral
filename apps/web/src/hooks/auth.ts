'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ApiError } from '@/services/api';
import type { LoginResponse, UserRole } from '@/shared/lib/types';
import { authService, type LoginSession } from '@/services/auth.service';
import { useAuth } from './auth-context';
import type { ChangePasswordInput, LoginInput } from '@/shared/lib/rules/auth';

/**
 * Submit credentials, store the session, and route the user to the right
 * landing page (force change-password if the API said so).
 */
export function useLogin(
  options?: UseMutationOptions<LoginResponse, ApiError, LoginInput>,
) {
  const router = useRouter();
  const { signIn } = useAuth();

  return useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: authService.login,
    onSuccess: (data, variables, onMutateResult, context) => {
      signIn(data);
      options?.onSuccess?.(data, variables, onMutateResult, context);
      router.push(data.mustChangePassword ? '/change-password' : '/dashboard');
    },
    ...options,
  });
}

export function useChangePassword(
  options?: UseMutationOptions<{ success: true }, ApiError, ChangePasswordInput>,
) {
  const router = useRouter();

  return useMutation<{ success: true }, ApiError, ChangePasswordInput>({
    mutationFn: (input) =>
      authService.changePassword({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      }),
    onSuccess: (data, variables, onMutateResult, context) => {
      options?.onSuccess?.(data, variables, onMutateResult, context);
      router.push('/dashboard');
    },
    ...options,
  });
}

export function useSignOut() {
  const router = useRouter();
  const { signOut } = useAuth();
  return useCallback(() => {
    signOut();
    router.push('/login');
  }, [router, signOut]);
}

/** Role-aware UI gate — render branches without crashing for unauthenticated. */
export function useHasRole(...allowed: UserRole[]) {
  const { user } = useAuth();
  if (!user) return false;
  return allowed.includes(user.role);
}

const sessionKeys = { list: ['auth', 'sessions'] as const };

/** Active login sessions for the signed-in user. */
export function useLoginSessions() {
  return useQuery<LoginSession[], ApiError>({
    queryKey: sessionKeys.list,
    queryFn: authService.listSessions,
  });
}

/** Revoke (sign out) one session, then refresh the list. */
export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation<{ success: true }, ApiError, string>({
    mutationFn: authService.revokeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.list }),
  });
}
