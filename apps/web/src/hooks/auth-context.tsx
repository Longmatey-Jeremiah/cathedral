'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import type { LoginResponse } from '@/shared/lib/types';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearSession,
  setSession,
  type SessionUser,
} from '@/store/slices/authSlice';

interface AuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** Set after the first client tick — gates protected routes safely. */
  isReady: boolean;
  signIn: (response: LoginResponse) => void;
  signOut: () => void;
}

/**
 * Auth state is held in the Redux auth slice (persisted via redux-persist).
 * `useAuth` is a thin selector hook so call sites stay unchanged after the move
 * off localStorage.
 */
export function useAuth(): AuthState {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.session?.user ?? null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const signIn = useCallback(
    (response: LoginResponse) => {
      dispatch(
        setSession({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        }),
      );
    },
    [dispatch],
  );

  const signOut = useCallback(() => {
    dispatch(clearSession());
  }, [dispatch]);

  return useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isReady,
      signIn,
      signOut,
    }),
    [user, isReady, signIn, signOut],
  );
}

/**
 * Single owner of the proactive token-refresh loop. Kept as a provider so the
 * 14-minute timer is mounted exactly once, not per `useAuth` consumer.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  useTokenRefresh(signOut);
  return <>{children}</>;
}
