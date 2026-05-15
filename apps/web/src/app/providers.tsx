'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/auth-context';
import { Toaster } from '@/shared/components/ui/sonner';
import { QueryProvider } from '@/shared/lib/query-provider';
import { ThemeProvider } from '@/shared/lib/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
