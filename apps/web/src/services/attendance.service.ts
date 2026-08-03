import type {
  AttendanceStatus,
  ServiceType,
  SessionDetail,
  SessionListItem,
} from '@/types/attendance';
import { api } from '@/services/api';
import { listQuery, type ListParams, type Paginated } from '@/shared/lib/list';

export interface ListSessionsParams extends ListParams {
  status?: AttendanceStatus;
  sortDir?: 'asc' | 'desc';
}

export type CreateSessionInput = {
  title: string;
  /** ISO date string. */
  date: string;
  /** Omit for a one-off gathering. */
  serviceTypeId?: string;
};

export type UpdateSessionInput = {
  title?: string;
  /** ISO date string. */
  date?: string;
  serviceTypeId?: string;
};

export type CreateServiceTypeInput = { name: string };
export type UpdateServiceTypeInput = { name?: string; isActive?: boolean };

export type SessionPage = Paginated<SessionListItem>;

function query(params: ListSessionsParams = {}): string {
  const search = new URLSearchParams(listQuery(params));
  if (params.status) search.set('status', params.status);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const attendanceService = {
  listServiceTypes: (includeInactive = false): Promise<ServiceType[]> =>
    api.get<ServiceType[]>(
      `/attendance/service-types?includeInactive=${includeInactive}`,
    ),
  createServiceType: (input: CreateServiceTypeInput) =>
    api.post<ServiceType>('/attendance/service-types', input),
  updateServiceType: (id: string, input: UpdateServiceTypeInput) =>
    api.patch<ServiceType>(`/attendance/service-types/${id}`, input),

  list: (params?: ListSessionsParams): Promise<SessionPage> =>
    api.get<SessionPage>(`/attendance/sessions?${query(params)}`),
  get: (id: string) => api.get<SessionDetail>(`/attendance/sessions/${id}`),
  create: (input: CreateSessionInput) =>
    api.post<SessionDetail>('/attendance/sessions', input),
  update: (id: string, input: UpdateSessionInput) =>
    api.patch<SessionDetail>(`/attendance/sessions/${id}`, input),
  /** Replace the full present-set for a session. */
  mark: (id: string, memberIds: string[]) =>
    api.put<{ success: true; presentCount: number }>(
      `/attendance/sessions/${id}/records`,
      { memberIds },
    ),
  submit: (id: string) =>
    api.post<SessionDetail>(`/attendance/sessions/${id}/submit`),
  review: (id: string) =>
    api.post<SessionDetail>(`/attendance/sessions/${id}/review`),
  remove: (id: string) =>
    api.delete<{ success: true }>(`/attendance/sessions/${id}`),
};
