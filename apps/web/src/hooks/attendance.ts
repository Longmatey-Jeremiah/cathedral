'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  attendanceService,
  type CreateSessionInput,
  type ListSessionsParams,
  type SessionPage,
  type UpdateSessionInput,
} from '@/services/attendance.service';
import type { ApiError } from '@/services/api';
import type { SessionDetail } from '@/types/attendance';

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params: ListSessionsParams = {}) =>
    [...attendanceKeys.lists(), params] as const,
  detail: (id: string) => [...attendanceKeys.all, 'detail', id] as const,
};

export function useSessions(params: ListSessionsParams = {}) {
  return useQuery<SessionPage, ApiError>({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSession(id: string | undefined) {
  return useQuery<SessionDetail, ApiError>({
    queryKey: attendanceKeys.detail(id ?? ''),
    queryFn: () => attendanceService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation<SessionDetail, ApiError, CreateSessionInput>({
    mutationFn: attendanceService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.lists() }),
  });
}

export function useMarkAttendance(id: string) {
  const qc = useQueryClient();
  return useMutation<{ success: true; presentCount: number }, ApiError, string[]>({
    mutationFn: (memberIds) => attendanceService.mark(id, memberIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.detail(id) });
      qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
  });
}

// Invalidate both the detail and the list after any state change.
function useSessionMutation<TVars>(
  id: string,
  mutationFn: (vars: TVars) => Promise<SessionDetail>,
) {
  const qc = useQueryClient();
  return useMutation<SessionDetail, ApiError, TVars>({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.detail(id) });
      qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
  });
}

export const useUpdateSession = (id: string) =>
  useSessionMutation<UpdateSessionInput>(id, (input) =>
    attendanceService.update(id, input),
  );

export const useSubmitSession = (id: string) =>
  useSessionMutation<void>(id, () => attendanceService.submit(id));

export const useReviewSession = (id: string) =>
  useSessionMutation<void>(id, () => attendanceService.review(id));

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation<{ success: true }, ApiError, string>({
    mutationFn: (id) => attendanceService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.lists() }),
  });
}
