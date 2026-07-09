'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  invitesService,
  type SendInviteInput,
  type SendInviteResult,
} from '@/services/invites.service';
import type { ApiError } from '@/services/api';
import type { Invite } from '@/types/invites';

export const inviteKeys = {
  all: ['invites'] as const,
  list: () => [...inviteKeys.all, 'list'] as const,
};

export function useInvites() {
  return useQuery<Invite[], ApiError>({
    queryKey: inviteKeys.list(),
    queryFn: invitesService.list,
  });
}

export function useSendInvite(
  options?: UseMutationOptions<SendInviteResult, ApiError, SendInviteInput>,
) {
  const qc = useQueryClient();
  return useMutation<SendInviteResult, ApiError, SendInviteInput>({
    mutationFn: invitesService.send,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: inviteKeys.list() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}
