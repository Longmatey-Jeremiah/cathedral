import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@/shared/lib/rules/departments';
import type { Department } from '@/types/departments';
import { api } from '@/services/api';
import {
  clean,
  listQuery,
  type ListParams,
  type Paginated,
} from '@/shared/lib/list';

export const departmentsService = {
  list: (params?: ListParams) =>
    api.get<Paginated<Department>>(`/departments?${listQuery(params)}`),
  get: (id: string) => api.get<Department>(`/departments/${id}`),
  create: (input: CreateDepartmentInput) =>
    api.post<Department>('/departments', clean(input)),
  update: (id: string, input: UpdateDepartmentInput) =>
    api.patch<Department>(`/departments/${id}`, clean(input)),
  remove: (id: string) =>
    api.delete<{ success: true }>(`/departments/${id}`),
};
