'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Input } from '@/shared/components/Input';
import { ApiError } from '@/shared/lib/api';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { useLogin } from '../hooks';
import { loginSchema, type LoginInput } from '../schemas';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  const login = useLogin();

  const onSubmit = handleSubmit((values) => {
    login.mutate(values);
  });

  const formError = formErrorMessage(login.error);
  const isPending = login.isPending || isSubmitting;

  return (
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
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            variant="framed"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@church.org"
            autoFocus
            startAdornment={<FiMail size={16} aria-hidden />}
            invalid={Boolean(errors.email)}
            disabled={isPending}
            {...register('email')}
          />
        </Field>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              id="password"
              variant="framed"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              startAdornment={<FiLock size={16} aria-hidden />}
              invalid={Boolean(errors.password)}
              disabled={isPending}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full text-stone transition-colors hover:bg-fog hover:text-carbon dark:hover:bg-white/[0.08] dark:hover:text-[var(--color-carbon)]"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </Field>
      </motion.div>

      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-[13px] text-stone underline-offset-4 hover:text-carbon hover:underline"
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

      <motion.p
        variants={fadeUp}
        className="text-center text-[13px] text-stone"
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/invite/accept"
          className="font-medium text-carbon underline-offset-4 hover:underline"
        >
          Use your invite link
        </Link>
      </motion.p>
    </motion.form>
  );
}

/**
 * Translate API errors into the message that should appear above the form.
 * Validation errors (already shown per-field) are suppressed; auth errors get
 * a friendlier copy than the raw API string.
 */
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
