import type {
  CareNote,
  CareNoteListItem,
  CareSummary,
  CareType,
  FollowUpFilter,
} from '@/types/care';
import { api } from '@/services/api';
import {
  clean,
  listQuery,
  type ListParams,
  type Paginated,
} from '@/shared/lib/list';

export interface ListCareNotesParams extends ListParams {
  memberId?: string;
  type?: CareType;
  followUp?: FollowUpFilter;
  sortBy?: 'createdAt' | 'followUpAt';
  sortDir?: 'asc' | 'desc';
}

export type CreateCareNoteInput = {
  memberId: string;
  type: CareType;
  body: string;
  confidential?: boolean;
  /** ISO date string; omit for a note with no follow-up. */
  followUpAt?: string;
};

export type UpdateCareNoteInput = {
  type?: CareType;
  body?: string;
  confidential?: boolean;
  /** Explicit null clears the follow-up. */
  followUpAt?: string | null;
};

export type CareNotePage = Paginated<CareNoteListItem>;

function query(params: ListCareNotesParams = {}): string {
  const search = new URLSearchParams(listQuery(params));
  if (params.memberId) search.set('memberId', params.memberId);
  if (params.type) search.set('type', params.type);
  if (params.followUp) search.set('followUp', params.followUp);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const careService = {
  list: (params?: ListCareNotesParams): Promise<CareNotePage> =>
    api.get<CareNotePage>(`/care-notes?${query(params)}`),
  summary: () => api.get<CareSummary>('/care-notes/summary'),
  get: (id: string) => api.get<CareNote>(`/care-notes/${id}`),
  create: (input: CreateCareNoteInput) =>
    api.post<CareNote>('/care-notes', clean(input)),
  // `clean` would strip an intentional null, so update sends the body as-is.
  update: (id: string, input: UpdateCareNoteInput) =>
    api.patch<CareNote>(`/care-notes/${id}`, input),
  resolve: (id: string) => api.patch<CareNote>(`/care-notes/${id}/resolve`),
  remove: (id: string) => api.delete<{ success: true }>(`/care-notes/${id}`),
};
