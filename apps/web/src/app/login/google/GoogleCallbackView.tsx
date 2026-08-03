'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth-context';
import { readGoogleCallback } from '@/shared/lib/google-callback';

/**
 * Lands here from the API's Google callback. The session arrives in the URL
 * fragment (never sent to a server); read it once, then wipe it from history.
 */
export function GoogleCallbackView() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const result = readGoogleCallback(window.location.hash);
    window.history.replaceState(null, '', window.location.pathname);

    if (!result.session) {
      setError(
        result.error === 'no_account'
          ? 'That Google account is not registered. Use your invite link first.'
          : 'Google sign-in failed. Please try again.',
      );
      return;
    }

    signIn(result.session);
    router.replace(
      result.session.mustChangePassword ? '/change-password' : '/dashboard',
    );
  }, [router, signIn]);

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      {error ? (
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Alert>{error}</Alert>
          <Button onClick={() => router.replace('/login')} className="w-full">
            Back to sign in
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      )}
    </main>
  );
}
