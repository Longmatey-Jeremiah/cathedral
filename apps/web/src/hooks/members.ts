'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  membersService,
  type CreateMemberInput,
  type UpdateMemberInput,
} from '@/services/members.service';
import type { ApiError } from '@/services/api';
import type { Member } from '@/types/members';

export const memberKeys = {
  all: ['members'] as const,
  list: () => [...memberKeys.all, 'list'] as const,
  detail: (id: string) => [...memberKeys.all, 'detail', id] as const,
};

export function useMembers() {
  return useQuery<Member[], ApiError>({
    queryKey: memberKeys.list(),
    queryFn: membersService.list,
  });
}

export function useMember(id: string | undefined) {
  return useQuery<Member, ApiError>({
    queryKey: memberKeys.detail(id ?? ''),
    queryFn: () => membersService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateMember(
  options?: UseMutationOptions<Member, ApiError, CreateMemberInput>,
) {
  const qc = useQueryClient();
  return useMutation<Member, ApiError, CreateMemberInput>({
    mutationFn: membersService.create,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: memberKeys.list() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useUpdateMember(
  id: string,
  options?: UseMutationOptions<Member, ApiError, UpdateMemberInput>,
) {
  const qc = useQueryClient();
  return useMutation<Member, ApiError, UpdateMemberInput>({
    mutationFn: (input) => membersService.update(id, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: memberKeys.list() });
      qc.invalidateQueries({ queryKey: memberKeys.detail(id) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}
