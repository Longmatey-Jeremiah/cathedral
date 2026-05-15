import { api } from '@/shared/lib/api';
import type { CreateChurchInput, UpdateChurchInput } from './schemas';
import type { Church } from './types';

/**
 * Empty strings come from optional form fields — the API expects either a
 * value or omission, never empty strings. Strip them before transport.
 */
function clean<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in input) {
    const value = input[key];
    if (value === '' || value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export const churchesApi = {
  list: () => api.get<Church[]>('/churches'),
  get: (id: string) => api.get<Church>(`/churches/${id}`),
  create: (input: CreateChurchInput) =>
    api.post<Church>('/churches', clean(input)),
  update: (id: string, input: UpdateChurchInput) =>
    api.patch<Church>(`/churches/${id}`, clean(input)),
  remove: (id: string) =>
    api.delete<{ success: true }>(`/churches/${id}`),
};
