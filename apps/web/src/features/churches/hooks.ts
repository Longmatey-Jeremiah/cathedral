'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api';
import { churchesApi } from './api';
import type { CreateChurchInput, UpdateChurchInput } from './schemas';
import type { Church } from './types';

export const churchKeys = {
  all: ['churches'] as const,
  list: () => [...churchKeys.all, 'list'] as const,
  detail: (id: string) => [...churchKeys.all, 'detail', id] as const,
};

export function useChurches() {
  return useQuery<Church[], ApiError>({
    queryKey: churchKeys.list(),
    queryFn: churchesApi.list,
  });
}

export function useChurch(id: string | undefined) {
  return useQuery<Church, ApiError>({
    queryKey: churchKeys.detail(id ?? ''),
    queryFn: () => churchesApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateChurch(
  options?: UseMutationOptions<Church, ApiError, CreateChurchInput>,
) {
  const qc = useQueryClient();
  return useMutation<Church, ApiError, CreateChurchInput>({
    mutationFn: churchesApi.create,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: churchKeys.list() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useUpdateChurch(
  id: string,
  options?: UseMutationOptions<Church, ApiError, UpdateChurchInput>,
) {
  const qc = useQueryClient();
  return useMutation<Church, ApiError, UpdateChurchInput>({
    mutationFn: (input) => churchesApi.update(id, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: churchKeys.list() });
      qc.invalidateQueries({ queryKey: churchKeys.detail(id) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useDeleteChurch(
  options?: UseMutationOptions<{ success: true }, ApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ success: true }, ApiError, string>({
    mutationFn: (id) => churchesApi.remove(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: churchKeys.list() });
      qc.removeQueries({ queryKey: churchKeys.detail(variables) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}
