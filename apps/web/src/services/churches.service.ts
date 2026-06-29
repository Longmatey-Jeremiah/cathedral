import type {
  CreateChurchInput,
  UpdateChurchInput,
} from '@/shared/lib/rules/churches';
import type { Church } from '@/types/churches';
import { api } from '@/services/api';
import {
  clean,
  listQuery,
  type ListParams,
  type Paginated,
} from '@/shared/lib/list';

export const churchesService = {
  list: (params?: ListParams) =>
    api.get<Paginated<Church>>(`/churches?${listQuery(params)}`),
  get: (id: string) => api.get<Church>(`/churches/${id}`),
  create: (input: CreateChurchInput) =>
    api.post<Church>('/churches', clean(input)),
  update: (id: string, input: UpdateChurchInput) =>
    api.patch<Church>(`/churches/${id}`, clean(input)),
  remove: (id: string) =>
    api.delete<{ success: true }>(`/churches/${id}`),
};
