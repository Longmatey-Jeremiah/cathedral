'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Emph } from '@/shared/components/Emph';
import { Logo } from '@/shared/components/Logo';
import { easeCalm, fadeUp, stagger } from '@/shared/lib/motion';

export function LoginView() {
  return (
    <main className="min-h-screen bg-fog-warm">
      <div className="grid min-h-screen md:grid-cols-2">
        {/* Left — brand panel */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: easeCalm }}
          className="relative hidden flex-col justify-between overflow-hidden bg-slate-warm p-12 md:flex md:border-r md:border-white/[0.06]"
        >
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Logo className="[&_span:last-child]:text-white [&_span:first-child]:bg-white [&_span:first-child]:text-carbon" />
            </Link>
            <Link
              href="/"
              className="text-[13px] text-white/75 transition hover:text-white"
            >
              ← Back home
            </Link>
          </header>

          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeCalm, delay: 0.25 }}
            className="max-w-md"
          >
            <p className="font-display text-[36px] leading-[1.15] tracking-[-0.5px] text-white">
              “<Emph>Calm</Emph> software, finally. Our finance team got their
              Sunday afternoon back.”
            </p>
            <footer className="mt-6 flex items-center gap-3 text-white/75">
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-full bg-tangerine-tag text-[12px] font-medium text-carbon"
              >
                DA
              </span>
              <span className="text-[13px]">
                Pastor Daniel Aboagye · Grace Central
              </span>
            </footer>
          </motion.blockquote>

          {/* Soft warm glow at the bottom */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="pointer-events-none absolute inset-x-0 -bottom-32 h-64"
            style={{
              background:
                'radial-gradient(60% 80% at 50% 100%, rgba(246,146,81,0.18) 0%, rgba(36,36,51,0) 70%)',
            }}
          />
        </motion.aside>

        {/* Right — form panel */}
        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: easeCalm, delay: 0.05 }}
          className="flex items-center justify-center bg-page-canvas p-6 md:bg-transparent md:p-12"
        >
          <motion.div
            variants={stagger(0.07, 0.15)}
            initial="hidden"
            animate="show"
            className="w-full max-w-[420px]"
          >
            {/* Mobile-only header */}
            <motion.div
              variants={fadeUp}
              className="mb-10 flex items-center justify-between md:hidden"
            >
              <Link href="/">
                <Logo />
              </Link>
              <Link
                href="/"
                className="text-[13px] text-stone transition hover:text-carbon"
              >
                ← Home
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-8">
              <h1 className="text-display-md text-carbon">Welcome back.</h1>
              <p className="mt-2 text-[15px] text-stone">
                Sign in to keep stewarding your congregation.
              </p>
            </motion.div>

            <LoginForm />

            <motion.p
              variants={fadeUp}
              className="mt-12 text-[12px] text-pebble"
            >
              By signing in you agree to our{' '}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-stone"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-stone"
              >
                Privacy Policy
              </Link>
              .
            </motion.p>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}
