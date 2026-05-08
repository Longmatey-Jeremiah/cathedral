'use client';

import { motion } from 'framer-motion';
import { Container } from './Container';
import { fadeUp, inView, stagger } from '../lib/motion';

const stats = [
  { value: '2.4M+', label: 'Members shepherded across deployed churches' },
  { value: '38%', label: 'Average lift in volunteer engagement after rollout' },
  { value: '< 30s', label: 'P95 response time for the entire dashboard' },
  { value: '99.98%', label: '12-month uptime measured at the edge' },
];

export function StatBand() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <motion.div
          {...inView}
          variants={stagger(0.08)}
          className="
            relative overflow-hidden rounded-[var(--radius-overlays)]
            bg-slate-warm p-10 md:p-14
            border border-white/[0.04]
            shadow-[0_30px_70px_-30px_rgba(36,36,51,0.45)]
            dark:border-white/[0.08]
            dark:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.75)]
          "
        >
          {/* Subtle grid texture for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative grid gap-10 md:grid-cols-4">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <div className="font-display text-[44px] leading-[1.05] tracking-[-0.04em] text-white md:text-[52px]">
                  {s.value}
                </div>
                <div className="mt-3 text-[13px] leading-[1.5] text-white/70">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
