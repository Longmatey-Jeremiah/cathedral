import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@/shared/lib/rules/departments';
import type { Department } from '@/types/departments';
import { api } from '@/services/api';

/** Strip empty-string optional fields before transport (see churches.service). */
function clean<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in input) {
    const value = input[key];
    if (value === '' || value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export const departmentsService = {
  list: () => api.get<Department[]>('/departments'),
  get: (id: string) => api.get<Department>(`/departments/${id}`),
  create: (input: CreateDepartmentInput) =>
    api.post<Department>('/departments', clean(input)),
  update: (id: string, input: UpdateDepartmentInput) =>
    api.patch<Department>(`/departments/${id}`, clean(input)),
  remove: (id: string) =>
    api.delete<{ success: true }>(`/departments/${id}`),
};
