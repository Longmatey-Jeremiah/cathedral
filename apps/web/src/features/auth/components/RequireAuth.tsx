'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { UserRole } from '@/shared/lib/types';
import { useAuth } from '../auth-context';

interface Props {
  children: ReactNode;
  /** If provided, the user's role must be in this list. Otherwise sent home. */
  roles?: UserRole[];
  /** Where to send unauthenticated users. Defaults to /login. */
  redirectTo?: string;
  /** Where to send authenticated users with the wrong role. Defaults to /dashboard. */
  forbiddenRedirectTo?: string;
}

/**
 * Client-side route guard. Renders nothing until the auth context has hydrated,
 * then either renders children or redirects. Pair with a server-side check
 * later when the API exposes a session cookie.
 */
export function RequireAuth({
  children,
  roles,
  redirectTo = '/login',
  forbiddenRedirectTo = '/dashboard',
}: Props) {
  const { user, isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
    if (roles && user && !roles.includes(user.role)) {
      router.replace(forbiddenRedirectTo);
    }
  }, [
    isReady,
    isAuthenticated,
    user,
    roles,
    redirectTo,
    forbiddenRedirectTo,
    router,
  ]);

  if (!isReady || !isAuthenticated) return null;
  if (roles && user && !roles.includes(user.role)) return null;
  return <>{children}</>;
}
