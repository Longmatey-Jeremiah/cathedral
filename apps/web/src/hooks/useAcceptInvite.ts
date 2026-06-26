'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { AcceptInviteInput } from '@/shared/lib/rules/auth';
import { ApiError } from '@/services/api';

type AcceptInviteVars = AcceptInviteInput & { token: string };

/**
 * Accept an invite (sets name + password). Accept-invite does NOT return a
 * session token, so we send the user to /login to sign in afterwards.
 */
export function useAcceptInvite(
  options?: UseMutationOptions<{ id: string }, ApiError, AcceptInviteVars>,
) {
  const router = useRouter();

  return useMutation<{ id: string }, ApiError, AcceptInviteVars>({
    mutationFn: authService.acceptInvite,
    onSuccess: (data, variables, onMutateResult, context) => {
      options?.onSuccess?.(data, variables, onMutateResult, context);
      router.push('/login?invited=1');
    },
    ...options,
  });
}
