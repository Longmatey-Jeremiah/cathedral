'use client';

import { motion } from 'framer-motion';
import { Button } from './Button';
import { Container } from './Container';
import { BrowserMockup } from './BrowserMockup';
import { Emph } from './Emph';
import { Pill } from './Pill';
import { StarRow } from './StarRow';
import { fadeUp, stagger } from '../lib/motion';

export function Hero() {
  return (
    <section className="relative bg-hero-canopy pt-[var(--nav-overlay-offset)]">
      <Container>
        <motion.div
          variants={stagger(0.08, 0.05)}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div variants={fadeUp}>
            <Pill className="mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-tangerine-tag" />
              New · Invite flow with role-based access
            </Pill>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-display-xl heading-fade md:leading-[1.05]"
          >
            The church platform that <Emph>runs</Emph> the whole congregation.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-[18px] leading-[1.5] text-stone"
          >
            Onboard staff, manage departments, and steward giving — all in one
            calm, modern dashboard. Built for the way real churches actually
            work.
          </motion.p>

          {/* Email + CTA inline form */}
          <motion.form
            id="book-demo"
            variants={fadeUp}
            action="#demo"
            className="mt-9 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <label className="relative flex-1">
              <span className="sr-only">Work email</span>
              <input
                type="email"
                placeholder="you@church.org"
                className="
                  w-full bg-transparent
                  border-0 border-b border-carbon/80
                  dark:border-white/45
                  rounded-[var(--radius-inputs)]
                  px-1 py-3 text-[15px] text-carbon
                  placeholder:text-pebble
                  dark:placeholder:text-stone
                  focus:outline-none focus:border-carbon
                  dark:focus:border-[var(--color-carbon)]
                "
              />
            </label>
            <Button type="submit" size="md" className="sm:w-auto text-white">
              Book a demo
            </Button>
          </motion.form>

          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            <StarRow
              badge={
                <span className="rounded-[6px] bg-fog px-2 py-1 text-[10px] font-medium tracking-wide text-graphite">
                  G2
                </span>
              }
              label="4.9 · 240+ reviews"
            />
            <StarRow
              badge={
                <span className="rounded-[6px] bg-fog px-2 py-1 text-[10px] font-medium tracking-wide text-graphite">
                  Capterra
                </span>
              }
              label="4.8 · churches in 22 countries"
            />
          </motion.div>
        </motion.div>

        {/* Mockup — independent reveal so the heavy paint doesn't block hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          className="relative mx-auto mt-16 w-full max-w-[1100px] md:mt-24"
        >
          <div className="animate-float">
            <BrowserMockup />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-1 h-32"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, var(--color-page-canvas) 80%)',
            }}
          />
        </motion.div>
      </Container>
    </section>
  );
}
