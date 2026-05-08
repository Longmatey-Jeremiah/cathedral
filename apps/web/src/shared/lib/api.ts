import type { ApiErrorPayload } from './types';
import { tokenStorage } from './storage';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/**
 * Typed wrapper around the API's HttpExceptionFilter response.
 *
 * `message` is normalized to a string for display — class-validator returns
 * an array of messages, so we join them when present.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload | null;

  constructor(status: number, payload: ApiErrorPayload | null, fallback: string) {
    const raw = payload?.message;
    const message = Array.isArray(raw) ? raw.join('. ') : raw ?? fallback;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }

  /** Convenience flag for UI gating (e.g. "show me the login screen"). */
  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isValidation() {
    return this.status === 400 || this.status === 422;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip Authorization header even when a token is present. */
  anonymous?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, anonymous, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (!anonymous) {
    const token = tokenStorage.get();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    // Network error / CORS / DNS — surface as a uniform ApiError(0).
    throw new ApiError(0, null, 'Could not reach the server. Check your connection.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // Non-JSON response — fall through with raw text in fallback.
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      isApiErrorPayload(payload) ? payload : null,
      typeof text === 'string' && text.length > 0
        ? text.slice(0, 200)
        : `Request failed with ${response.status}`,
    );
  }

  return payload as T;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'message' in value
  );
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
