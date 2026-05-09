'use client';

import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { LinkButton } from './Button';
import { Container } from './Container';
import { Emph } from './Emph';
import { Pill } from './Pill';
import { cn } from '../lib/cn';
import { easeCalm, fadeUp, inView, stagger } from '../lib/motion';

interface Tier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const tiers: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    cadence: 'per month',
    tagline: 'For small congregations finding their feet.',
    features: [
      'Up to 200 active members',
      'Manual + invite onboarding flows',
      'Attendance & basic giving',
      'Email support',
    ],
    cta: 'Start free pilot',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$129',
    cadence: 'per month',
    tagline: 'For churches running real programs every week.',
    features: [
      'Up to 1,000 active members',
      'Departments, rotas, and audit log',
      'Reconciled giving with funds',
      'Role-based access (4 roles)',
      'Priority migration assistance',
    ],
    cta: 'Choose Growth',
    highlight: true,
  },
  {
    id: 'network',
    name: 'Network',
    price: '$349',
    cadence: 'per month',
    tagline: 'For multi-campus and church networks.',
    features: [
      'Unlimited members & campuses',
      'Network-wide reporting',
      'SSO + SCIM provisioning',
      'Dedicated success manager',
      'Custom data residency',
    ],
    cta: 'Talk to us',
  },
];

function Card({ tier, index }: { tier: Tier; index: number }) {
  const isHighlight = !!tier.highlight;

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={cn(
        'relative flex flex-col rounded-[var(--radius-cards)] border p-7 md:p-8',
        'transition-shadow duration-300',
        isHighlight
          ? 'bg-cta-warm border-tangerine-tag/30 shadow-[0_24px_60px_-32px_rgba(233,116,45,0.45)] dark:border-tangerine-tag/40 dark:shadow-[0_24px_60px_-28px_rgba(233,116,45,0.35)]'
          : 'bg-snow border-black/[0.06] shadow-card dark:border-white/[0.1] dark:shadow-[0_8px_40px_-20px_rgba(0,0,0,0.55)]',
      )}
      aria-label={`${tier.name} plan`}
    >
      {isHighlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-badges)] btn-primary-surface px-3 py-1 text-[11px] font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            Most popular
          </span>
        </div>
      )}

      <header className="flex items-center justify-between">
        <h3 className="font-display text-[20px] tracking-[-0.02em] text-carbon">
          {tier.name}
        </h3>
        <Pill variant={isHighlight ? 'snow' : 'fog'} className="border-0">
          Tier {index + 1}
        </Pill>
      </header>

      <p className="mt-3 text-[14px] leading-[1.55] text-stone">
        {tier.tagline}
      </p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-[56px] leading-none tracking-[-0.04em] text-carbon">
          {tier.price}
        </span>
        <span className="text-[13px] text-stone">{tier.cadence}</span>
      </div>

      <ul className="mt-7 space-y-3 border-t border-black/[0.06] pt-6 dark:border-white/[0.1]">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-[14px] leading-[1.5] text-graphite"
          >
            <span
              aria-hidden
              className={cn(
                'mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full',
                isHighlight ? 'btn-primary-surface' : 'bg-fog',
              )}
            >
              <FiCheck
                size={10}
                className={isHighlight ? 'text-white' : 'text-carbon'}
              />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <LinkButton
          href="#book-demo"
          variant={isHighlight ? 'primary' : 'ghost'}
          size="md"
          className="w-full"
        >
          {tier.cta}
        </LinkButton>
      </div>
    </motion.article>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 md:py-28">
      <Container>
        <motion.div
          {...inView}
          variants={stagger(0.08)}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Pill className="mb-5">Pricing</Pill>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-display-lg heading-fade">
            <Emph>Honest</Emph> pricing, every feature included.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-[16px] leading-[1.6] text-stone"
          >
            Flat per-month based on active members. Unlimited admins, unlimited
            departments, every feature on every tier. No surprise add-ons —
            ever.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger(0.1, 0.05)}
          className="grid gap-5 md:grid-cols-3 md:gap-6"
        >
          {tiers.map((t, i) => (
            <Card key={t.id} tier={t} index={i} />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5, ease: easeCalm }}
          className="mt-10 text-center text-[13px] text-stone"
        >
          All plans include a 30-day pilot, free migration, and an audit log.
          Need a discount for churches outside high-income economies?{' '}
          <a
            href="#book-demo"
            className="font-medium text-carbon underline underline-offset-4"
          >
            Just tell us
          </a>
          .
        </motion.p>
      </Container>
    </section>
  );
}
