'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { Emph } from '@/components/Emph';
import { Logo } from '@/components/Logo';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputGroup } from '@/components/ui/input';
import { ApiError } from '@/services/api';
import { useAcceptInvite } from '@/hooks/useAcceptInvite';
import { authService } from '@/services/auth.service';
import { acceptInviteSchema, type AcceptInviteInput } from '@/shared/lib/rules/auth';

export function AcceptInviteView({ token }: { token: string }) {
  const invite = useQuery({
    queryKey: ['invite', token],
    queryFn: () => authService.validateInvite(token),
    enabled: Boolean(token),
    retry: false,
  });

  return (
    <main className="grid min-h-screen place-items-center bg-fog-warm p-6">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/login"
            className="text-[13px] text-stone transition hover:text-carbon"
          >
            Sign in instead
          </Link>
        </div>

        {!token ? (
          <Alert>This invite link is missing its token. Ask your admin to resend it.</Alert>
        ) : invite.isLoading ? (
          <p className="text-[15px] text-stone">Checking your invite…</p>
        ) : invite.isError ? (
          <Alert>
            {invite.error instanceof ApiError && invite.error.isUnauthorized
              ? 'This invite is invalid or has expired. Ask your admin to send a new one.'
              : 'We could not validate this invite. Please try again in a moment.'}
          </Alert>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-display-md text-carbon">
                Welcome to <Emph>Cathedral</Emph>.
              </h1>
              <p className="mt-2 text-[15px] text-stone">
                Setting up the account for{' '}
                <span className="font-medium text-carbon">{invite.data!.email}</span>.
              </p>
            </div>
            <AcceptInviteForm token={token} />
          </>
        )}
      </div>
    </main>
  );
}

function AcceptInviteForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    mode: 'onSubmit',
    defaultValues: { firstName: '', lastName: '', password: '' },
  });

  const accept = useAcceptInvite();

  const onSubmit = form.handleSubmit((values) => {
    accept.mutate({ ...values, token });
  });

  const formError = formErrorMessage(accept.error);
  const isPending = accept.isPending || form.formState.isSubmitting;

  const inputClass =
    'h-11 flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-0';

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-5"
        aria-busy={isPending || undefined}
      >
        {formError ? <Alert>{formError}</Alert> : null}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <InputGroup invalid={Boolean(fieldState.error)}>
                    <input
                      autoComplete="given-name"
                      placeholder="Jane"
                      autoFocus
                      disabled={isPending}
                      className={inputClass}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <InputGroup invalid={Boolean(fieldState.error)}>
                    <input
                      autoComplete="family-name"
                      placeholder="Doe"
                      disabled={isPending}
                      className={inputClass}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <InputGroup
                    invalid={Boolean(fieldState.error)}
                    startAdornment={<FiLock size={16} aria-hidden />}
                    className="pr-10"
                  >
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      disabled={isPending}
                      className={inputClass}
                      {...field}
                    />
                  </InputGroup>
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? 'Setting up…' : 'Create account'}
        </Button>
      </form>
    </Form>
  );
}

function formErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.isUnauthorized) {
      return 'This invite is no longer valid. Ask your admin to send a new one.';
    }
    if (error.status === 0) {
      return 'Could not reach the server. Please try again in a moment.';
    }
    if (error.isValidation) return null;
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
