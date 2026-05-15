'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

type Props = React.ComponentProps<typeof SonnerToaster>;

export function Toaster(props: Props) {
  const { theme = 'system' } = useTheme();
  return (
    <SonnerToaster
      theme={theme as Props['theme']}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'rounded-[var(--radius-cardinner)] border border-border bg-card text-foreground shadow-card',
          description: 'text-muted-foreground',
          actionButton: 'rounded-md bg-foreground text-background',
          cancelButton: 'rounded-md bg-muted text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}

export { toast } from 'sonner';
