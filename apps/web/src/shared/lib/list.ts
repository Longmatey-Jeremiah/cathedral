/** Shared helpers for paginated, searchable list endpoints. */

export interface ListParams {
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Build the `?page&pageSize&q` query string for a list request. */
export function listQuery({ page = 1, pageSize = 25, q }: ListParams = {}): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) params.set('q', q);
  return params.toString();
}

/**
 * Drop empty-string / undefined optional fields — forms emit `''`, but the API
 * expects a value or omission, never an empty string.
 */
export function clean<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in input) {
    const value = input[key];
    if (value === '' || value === undefined) continue;
    out[key] = value;
  }
  return out;
}
