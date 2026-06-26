'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/shared/lib/query-provider';
import { ThemeProvider } from '@/shared/lib/theme-provider';
import { StoreProvider } from '@/store/StoreProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
