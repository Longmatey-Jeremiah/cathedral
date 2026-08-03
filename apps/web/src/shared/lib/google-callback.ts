import type { LoginResponse } from '@/shared/lib/types';

export interface GoogleCallbackResult {
  session?: LoginResponse;
  error?: string;
}

/**
 * Decode the base64url payload the API puts in the callback URL fragment.
 * Anything malformed is treated as a failed sign-in rather than trusted — the
 * fragment is user-editable, so a shape check is the trust boundary here.
 */
export function readGoogleCallback(hash: string): GoogleCallbackResult {
  const encoded = hash.replace(/^#/, '');
  if (!encoded) return { error: 'missing' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return { error: 'malformed' };
  }

  if (!parsed || typeof parsed !== 'object') return { error: 'malformed' };

  const { session, error } = parsed as Record<string, unknown>;
  if (typeof error === 'string') return { error };
  if (!isLoginResponse(session)) return { error: 'malformed' };

  return { session };
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.accessToken === 'string' &&
    typeof v.refreshToken === 'string' &&
    typeof v.user === 'object' &&
    v.user !== null &&
    typeof (v.user as Record<string, unknown>).id === 'string'
  );
}
