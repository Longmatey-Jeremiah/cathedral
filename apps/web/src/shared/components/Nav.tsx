'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { LinkButton } from './Button';
import { Container } from './Container';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/cn';
import { easeCalm } from '../lib/motion';

const MOBILE_MENU_ID = 'site-mobile-menu';

const links = [
  { href: '#product', label: 'Product' },
  { href: '#flows', label: 'Flows' },
  { href: '#testimonials', label: 'Stories' },
  { href: '#pricing', label: 'Pricing' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-[100] pt-[env(safe-area-inset-top,0px)]">
      <Container className="pointer-events-auto">
        <motion.nav
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeCalm }}
          className={cn(
            'flex items-center justify-between gap-3 px-3 py-2 sm:gap-6 md:px-4',
            'rounded-[32px] bg-snow/80 backdrop-blur-md',
            'border border-black/[0.04] shadow-card',
            'transition-[background,box-shadow,border-color] duration-300',
            'dark:border-white/[0.08] dark:bg-[var(--color-snow)]/85',
            scrolled && 'bg-snow/95 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.18)]',
            scrolled && 'dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.65)]',
          )}
          aria-label="Primary"
        >
          <Link
            href="/"
            aria-label="Home"
            className="px-2"
            onClick={closeMobile}
          >
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="relative px-3 py-2 text-[14px] font-medium text-stone transition-colors hover:text-carbon"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden px-3 py-2 text-[14px] font-medium text-stone transition hover:text-carbon md:inline-block"
            >
              Sign in
            </Link>
            <div className="hidden md:block">
              <LinkButton href="#book-demo" size="sm" className="text-white">
                Book a demo
              </LinkButton>
            </div>
            <button
              type="button"
              id={`${MOBILE_MENU_ID}-toggle`}
              aria-expanded={mobileOpen}
              aria-controls={MOBILE_MENU_ID}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
              className={cn(
                'relative grid h-9 w-9 shrink-0 place-items-center rounded-full md:hidden',
                'border border-black/[0.08] bg-fog/90 text-carbon transition-colors',
                'hover:bg-fog dark:border-white/[0.12] dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.12]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbon focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-canvas)]',
              )}
            >
              {mobileOpen ? (
                <FiX size={18} strokeWidth={2} aria-hidden />
              ) : (
                <FiMenu size={18} strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
        </motion.nav>
      </Container>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              key="mobile-backdrop"
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto fixed inset-0 z-[90] bg-carbon/45 backdrop-blur-[2px] md:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              key="mobile-panel"
              id={MOBILE_MENU_ID}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${MOBILE_MENU_ID}-title`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className={cn(
                'pointer-events-auto fixed inset-y-0 right-0 z-[95] flex w-full max-w-sm flex-col',
                'border-l border-black/[0.06] bg-snow shadow-2xl',
                'dark:border-white/[0.1] dark:bg-[var(--color-snow)] md:hidden',
              )}
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.1]">
                <span
                  id={`${MOBILE_MENU_ID}-title`}
                  className="font-display text-[17px] text-carbon"
                >
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={closeMobile}
                  className="grid h-9 w-9 place-items-center rounded-full border border-black/[0.08] text-carbon transition hover:bg-fog dark:border-white/[0.12] dark:hover:bg-white/[0.08]"
                >
                  <FiX size={18} aria-hidden />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={closeMobile}
                    className="rounded-[var(--radius-small)] px-4 py-3 text-[15px] font-medium text-carbon transition hover:bg-fog dark:hover:bg-white/[0.06]"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="rounded-[var(--radius-small)] px-4 py-3 text-[15px] font-medium text-stone transition hover:bg-fog hover:text-carbon dark:hover:bg-white/[0.06]"
                >
                  Sign in
                </Link>
              </nav>

              <div className="border-t border-black/[0.06] p-5 dark:border-white/[0.1]">
                <LinkButton
                  href="#book-demo"
                  size="lg"
                  fullWidth
                  className="justify-center text-white"
                  onClick={closeMobile}
                >
                  Book a demo
                </LinkButton>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
