'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { ActivityList } from '@/features/dashboard/components/ActivityList';
import { AttendancePanel } from '@/features/dashboard/components/AttendancePanel';
import { ChurchesPanel } from '@/features/dashboard/components/ChurchesPanel';
import { GivingPanel } from '@/features/dashboard/components/GivingPanel';
import { KpiCard } from '@/features/dashboard/components/KpiCard';
import { PanelCard } from '@/features/dashboard/components/PanelCard';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import {
  churchContext,
  overviewKpis,
  platformKpis,
} from '@/features/dashboard/mock-data';
import { Emph } from '@/shared/components/Emph';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { UserRole } from '@/shared/lib/types';

export default function DashboardOverview() {
  const { user } = useAuth();
  const greeting = useTimeGreeting();

  if (!user) return null;

  const isSuper = user.role === UserRole.SUPER_ADMIN;
  const firstName = user.firstName ?? 'there';
  const kpis = isSuper ? platformKpis : overviewKpis;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      {/* Greeting */}
      <motion.header variants={fadeUp} className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[12px] uppercase tracking-[0.1em] text-pebble">
            {isSuper ? 'Platform · all tenants' : churchContext.name}
          </p>
          <h1 className="mt-2 font-display text-[36px] leading-[1.1] tracking-[-0.5px] text-carbon">
            {greeting}, <Emph>{firstName}</Emph>.
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-stone">
            {isSuper
              ? 'Everything across your churches at a glance. Calm by default.'
              : `Here is your week. Sunday rests up ahead — ${churchContext.todayLabel}.`}
          </p>
        </div>
      </motion.header>

      {/* KPIs */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.key}
            label={k.label}
            value={k.value}
            delta={k.delta}
            tone={k.tone}
          />
        ))}
      </section>

      {/* Primary panels */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isSuper ? <ChurchesPanel /> : <AttendancePanel />}
        </div>
        <div>
          <GivingPanel />
        </div>
      </section>

      {/* Lower panels */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard
          title="Recent activity"
          subtitle="Audit trail · last 24 hours"
          action={{ label: 'See all', href: '/dashboard/audit' }}
          className="lg:col-span-2"
        >
          <ActivityList />
        </PanelCard>

        <QuickActions role={user.role} />
      </section>
    </motion.div>
  );
}

/**
 * Time-of-day greeting that hydrates on the client to avoid a server/client
 * mismatch from `new Date()` running in two timezones.
 */
function useTimeGreeting() {
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return greeting;
}
