'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, InputGroup, inlineInput } from '@/components/ui/input';
import { ApiError } from '@/services/api';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { useLogin } from '@/hooks/auth';
import { loginSchema, type LoginInput } from '@/shared/lib/rules/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
// Mirrors GOOGLE_CLIENT_ID on the API — set both or neither.
const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  const login = useLogin();

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values);
  });

  const formError = formErrorMessage(login.error);
  const isPending = login.isPending || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <motion.form
        noValidate
        onSubmit={onSubmit}
        variants={stagger(0.06, 0.1)}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
        aria-busy={isPending || undefined}
      >
        {formError ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Alert>{formError}</Alert>
          </motion.div>
        ) : null}

        <motion.div variants={fadeUp}>
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputGroup
                    invalid={Boolean(fieldState.error)}
                    startAdornment={<FiMail size={16} aria-hidden />}
                  >
                    <Input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@church.org"
                      autoFocus
                      disabled={isPending}
                      className={inlineInput}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
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
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={isPending}
                        className={inlineInput}
                        {...field}
                      />
                    </InputGroup>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      aria-pressed={showPassword}
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <FiEyeOff size={16} />
                      ) : (
                        <FiEye size={16} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <Link
            href="/forgot-password"
            className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </motion.div>

        {googleEnabled ? (
          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                or
              </span>
              <Separator className="flex-1" />
            </div>
            {/* A plain link, not a fetch: OAuth needs a top-level navigation. */}
            <Button asChild variant="outline" size="lg" className="w-full">
              <a href={`${API_URL}/auth/google`}>
                <FcGoogle size={18} aria-hidden />
                Continue with Google
              </a>
            </Button>
          </motion.div>
        ) : null}

        <motion.p
          variants={fadeUp}
          className="text-center text-[13px] text-muted-foreground"
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/invite/accept"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Use your invite link
          </Link>
        </motion.p>
      </motion.form>
    </Form>
  );
}

function formErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.isUnauthorized) return 'Email or password is incorrect.';
    if (error.status === 0) {
      return 'Could not reach the server. Please try again in a moment.';
    }
    if (error.isValidation) return null;
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

// Suppress unused-import note — `Input` is exported from the same module the
// rest of the form imports, but we don't use it directly here. Keeping the
// reference so TypeScript treats the path as live.
void Input;
