import type {
  Member,
  MemberListItem,
  MemberStatus,
  DepartmentRole,
} from '@/types/members';
import { api } from '@/services/api';
import {
  clean,
  listQuery,
  type ListParams,
  type Paginated,
} from '@/shared/lib/list';

export interface ListMembersParams extends ListParams {
  status?: MemberStatus;
  departmentId?: string;
  sortBy?: 'name' | 'status' | 'joinDate';
  sortDir?: 'asc' | 'desc';
}

export interface DepartmentAssignment {
  departmentId: string;
  role?: DepartmentRole;
}

export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  phone?: string;
  status?: MemberStatus;
  userId?: string;
  departments?: DepartmentAssignment[];
};

export type UpdateMemberInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: MemberStatus;
  departments?: DepartmentAssignment[];
};

export type MemberPage = Paginated<MemberListItem>;

function query(params: ListMembersParams = {}): string {
  const search = new URLSearchParams(listQuery(params));
  if (params.status) search.set('status', params.status);
  if (params.departmentId) search.set('departmentId', params.departmentId);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const membersService = {
  list: (params?: ListMembersParams): Promise<MemberPage> =>
    api.get<MemberPage>(`/members?${query(params)}`),
  get: (id: string) => api.get<Member>(`/members/${id}`),
  create: (input: CreateMemberInput) =>
    api.post<Member>('/members', clean(input)),
  update: (id: string, input: UpdateMemberInput) =>
    api.patch<Member>(`/members/${id}`, clean(input)),
  remove: (id: string) => api.delete<{ success: true }>(`/members/${id}`),
};
