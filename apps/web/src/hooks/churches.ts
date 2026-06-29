'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { ApiError } from '@/services/api';
import { churchesService } from '@/services/churches.service';
import type { CreateChurchInput, UpdateChurchInput } from '@/shared/lib/rules/churches';
import type { Church } from '@/types/churches';
import type { ListParams, Paginated } from '@/shared/lib/list';

export const churchKeys = {
  all: ['churches'] as const,
  lists: () => [...churchKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...churchKeys.lists(), params] as const,
  detail: (id: string) => [...churchKeys.all, 'detail', id] as const,
};

export function useChurches(params: ListParams = {}) {
  return useQuery<Paginated<Church>, ApiError>({
    queryKey: churchKeys.list(params),
    queryFn: () => churchesService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useChurch(id: string | undefined) {
  return useQuery<Church, ApiError>({
    queryKey: churchKeys.detail(id ?? ''),
    queryFn: () => churchesService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateChurch(
  options?: UseMutationOptions<Church, ApiError, CreateChurchInput>,
) {
  const qc = useQueryClient();
  return useMutation<Church, ApiError, CreateChurchInput>({
    mutationFn: churchesService.create,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: churchKeys.lists() });
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
    mutationFn: (input) => churchesService.update(id, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: churchKeys.lists() });
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
    mutationFn: (id) => churchesService.remove(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: churchKeys.lists() });
      qc.removeQueries({ queryKey: churchKeys.detail(variables) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}
