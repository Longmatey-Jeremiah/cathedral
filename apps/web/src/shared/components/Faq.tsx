'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Container } from './Container';
import { Emph } from './Emph';
import { Pill } from './Pill';
import { cn } from '../lib/cn';
import { easeCalm, fadeUp, inView, stagger } from '../lib/motion';

const faqs = [
  {
    q: 'How long does it take to migrate from our current system?',
    a: 'Most churches go live in a single weekend. We import members, departments, and giving history from CSV or your previous tool. A migration specialist owns the project end-to-end so your staff only verifies — they never wrangle.',
  },
  {
    q: 'Is data really safe? Our finance records are sensitive.',
    a: 'All sensitive fields are encrypted at rest, every change is recorded in an immutable audit log, and role-based access controls let you scope what each leader can see. Tithe records are visible only to roles you explicitly authorize.',
  },
  {
    q: 'Do volunteers really log in, or is this just for staff?',
    a: 'Both. Department leaders get a focused view of their teams and rotas; volunteers get a calm mobile-friendly portal for sign-ups, attendance, and messaging. We optimized the UI to make logging in feel like reading a clean inbox, not filing a tax return.',
  },
  {
    q: 'What if we have multiple campuses?',
    a: 'Multi-campus is a first-class concept. Members, services, finances, and reporting can be scoped per campus or rolled up at the network level. Permissions follow the same hierarchy, so a campus pastor only sees their campus by default.',
  },
  {
    q: 'How does pricing work?',
    a: 'Flat per-month based on active members, with unlimited admins, unlimited departments, and every feature included. No surprise add-ons. We discount for churches outside high-income economies — just tell us where you are.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-20 md:py-28">
      <Container>
        <motion.div
          {...inView}
          variants={stagger(0.1)}
          className="grid gap-12 md:grid-cols-[360px_1fr] md:gap-20"
        >
          <motion.div variants={fadeUp}>
            <Pill className="mb-5">Common questions</Pill>
            <h2 className="text-display-lg heading-fade">
              <Emph>Answers</Emph>, before you ask.
            </h2>
            <p className="mt-4 text-[16px] text-stone">
              Honest answers from teams who have done this 200+ times.
            </p>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            className="divide-y divide-black/[0.06] border-t border-black/[0.06] dark:divide-white/[0.1] dark:border-white/[0.1]"
          >
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-[20px] leading-[1.3] text-carbon md:text-[24px]">
                      {f.q}
                    </span>
                    <motion.span
                      aria-hidden
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: easeCalm }}
                      className="mt-2 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fog text-carbon"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: easeCalm }}
                        className="overflow-hidden"
                      >
                        <p
                          className={cn(
                            'pb-6 pr-12 text-[15px] leading-[1.6] text-stone',
                          )}
                        >
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </motion.ul>
        </motion.div>
      </Container>
    </section>
  );
}
