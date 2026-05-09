'use client';

import { motion } from 'framer-motion';
import { LinkButton } from './Button';
import { Container } from './Container';
import { Emph } from './Emph';
import { fadeUp, inView, stagger } from '../lib/motion';

export function CtaBand() {
  return (
    <section id="demo" className="pb-24 pt-12 md:pb-32">
      <Container>
        <motion.div
          {...inView}
          variants={stagger(0.08)}
            className="
            relative overflow-hidden rounded-[var(--radius-overlays)] bg-cta-warm
            border border-black/[0.04] shadow-card dark:border-white/[0.1]
            px-8 py-16 md:px-16 md:py-24
          "
        >
          <div className="relative mx-auto max-w-2xl text-center">
            <motion.h2
              variants={fadeUp}
              className="text-display-lg heading-fade"
            >
              Bring <Emph>calm</Emph> to the way your church runs.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-5 text-[17px] leading-[1.55] text-stone"
            >
              See Cathedral on your own data in a 20-minute demo. We will set up
              a sandbox with your last quarter of services and finance, so the
              value is obvious before you ever say yes.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <LinkButton href="#book-demo" size="lg" className="text-white">
                Book a demo
              </LinkButton>
              <LinkButton
                href="#product"
                variant="ghost"
                size="lg"
                className="text-carbon"
              >
                See the product tour
              </LinkButton>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 text-[12px] text-stone">
              30-day pilot · no credit card · migration included
            </motion.p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
