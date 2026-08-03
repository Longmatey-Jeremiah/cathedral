'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  careService,
  type CareNotePage,
  type CreateCareNoteInput,
  type ListCareNotesParams,
  type UpdateCareNoteInput,
} from '@/services/care.service';
import type { ApiError } from '@/services/api';
import type { CareNote, CareSummary } from '@/types/care';

export const careKeys = {
  all: ['care-notes'] as const,
  lists: () => [...careKeys.all, 'list'] as const,
  list: (params: ListCareNotesParams = {}) =>
    [...careKeys.lists(), params] as const,
  detail: (id: string) => [...careKeys.all, 'detail', id] as const,
  summary: () => [...careKeys.all, 'summary'] as const,
};

export function useCareNotes(params: ListCareNotesParams = {}) {
  return useQuery<CareNotePage, ApiError>({
    queryKey: careKeys.list(params),
    queryFn: () => careService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCareSummary() {
  return useQuery<CareSummary, ApiError>({
    queryKey: careKeys.summary(),
    queryFn: () => careService.summary(),
  });
}

export function useCareNote(id: string | undefined) {
  return useQuery<CareNote, ApiError>({
    queryKey: careKeys.detail(id ?? ''),
    queryFn: () => careService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCareNote(
  options?: UseMutationOptions<CareNote, ApiError, CreateCareNoteInput>,
) {
  const qc = useQueryClient();
  return useMutation<CareNote, ApiError, CreateCareNoteInput>({
    mutationFn: careService.create,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: careKeys.lists() });
      qc.invalidateQueries({ queryKey: careKeys.summary() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useUpdateCareNote(
  id: string,
  options?: UseMutationOptions<CareNote, ApiError, UpdateCareNoteInput>,
) {
  const qc = useQueryClient();
  return useMutation<CareNote, ApiError, UpdateCareNoteInput>({
    mutationFn: (input) => careService.update(id, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: careKeys.lists() });
      qc.invalidateQueries({ queryKey: careKeys.detail(id) });
      qc.invalidateQueries({ queryKey: careKeys.summary() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

/** Close out a follow-up — the overdue queue and counters both change. */
export function useResolveCareNote(
  options?: UseMutationOptions<CareNote, ApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<CareNote, ApiError, string>({
    mutationFn: (id) => careService.resolve(id),
    onSuccess: (data, id, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: careKeys.lists() });
      qc.invalidateQueries({ queryKey: careKeys.detail(id) });
      qc.invalidateQueries({ queryKey: careKeys.summary() });
      options?.onSuccess?.(data, id, onMutateResult, context);
    },
    ...options,
  });
}
