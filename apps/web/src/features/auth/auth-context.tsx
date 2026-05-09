'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { tokenStorage } from '@/shared/lib/storage';
import type { LoginResponse } from '@/shared/lib/types';

type SessionUser = LoginResponse['user'];

interface AuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** Set after the first hydration tick — gates protected routes safely. */
  isReady: boolean;
  signIn: (response: LoginResponse) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
const USER_KEY = 'cmp.session_user';

function readUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Token + user are read on the client; without this gate, a flash of the
    // logged-out state would race with hydration on protected routes.
    const token = tokenStorage.get();
    setUser(token ? readUser() : null);
    setIsReady(true);
  }, []);

  const signIn = useCallback((response: LoginResponse) => {
    tokenStorage.set(response.accessToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_KEY);
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isReady,
      signIn,
      signOut,
    }),
    [user, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
