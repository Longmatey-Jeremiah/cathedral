'use client';

import { useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { store } from '@/store';
import { setTokens } from '@/store/slices/authSlice';

// Access tokens live 15m — refresh a minute early so requests never race the
// expiry. Pattern mirrors papermap's useTokenRefresh (proactive timer +
// retry), minus its cross-tab Web Locks mutex which this app doesn't need yet.
// ponytail: single-tab. If multiple tabs cause refresh races, add a Web Locks
// guard like papermap's tokenRefreshLock.
const REFRESH_INTERVAL_MS = 14 * 60_000;

/**
 * Rotate the access + refresh tokens every 14 minutes. On failure it retries
 * once; if that also fails the session is treated as expired (`onExpired`).
 */
export function useTokenRefresh(onExpired: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    async function rotate(): Promise<void> {
      const refreshToken = store.getState().auth.session?.refreshToken;
      if (!refreshToken) return; // not signed in
      const res = await authService.refresh(refreshToken);
      if (cancelled) return;
      store.dispatch(
        setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        }),
      );
    }

    async function tick(): Promise<void> {
      if (!store.getState().auth.session?.refreshToken) return;
      try {
        await rotate();
      } catch {
        // refetch once if it fails
        try {
          await rotate();
        } catch {
          if (!cancelled) onExpired();
        }
      }
    }

    const id = setInterval(tick, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [onExpired]);
}
