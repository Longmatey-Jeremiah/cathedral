'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Container } from './Container';
import { Pill } from './Pill';
import { cn } from '../lib/cn';
import { easeCalm, fadeUp, inView, stagger } from '../lib/motion';

interface Props {
  label: string;
  heading: ReactNode;
  body: string;
  bullets?: string[];
  visual: ReactNode;
  reverse?: boolean;
}

export function FeatureRow({
  label,
  heading,
  body,
  bullets,
  visual,
  reverse,
}: Props) {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <motion.div
          {...inView}
          variants={stagger(0.1)}
          className={cn(
            'grid items-center gap-10 md:grid-cols-2 md:gap-16',
            reverse && 'md:[&>:first-child]:order-2',
          )}
        >
          <motion.div variants={fadeUp} className="max-w-md">
            <Pill className="mb-5">{label}</Pill>
            <h2 className="text-display-lg text-carbon">{heading}</h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-stone">{body}</p>
            {bullets && (
              <motion.ul
                variants={stagger(0.06, 0.1)}
                className="mt-6 space-y-3"
              >
                {bullets.map((b) => (
                  <motion.li
                    key={b}
                    variants={fadeUp}
                    className="flex items-start gap-3 text-[14px] text-graphite"
                  >
                    <span
                      aria-hidden
                      className="mt-[6px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-carbon"
                    />
                    <span>{b}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reverse ? -32 : 32, scale: 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: easeCalm, delay: 0.05 }}
          >
            {visual}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
