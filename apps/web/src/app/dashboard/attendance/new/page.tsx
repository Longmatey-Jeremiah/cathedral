'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateSession } from '@/hooks/attendance';
import { BackLink } from '@/components/admin/BackLink';
import { Button } from '@/components/Button';
import { Emph } from '@/components/Emph';
import { PageHeader } from '@/components/admin/PageHeader';
import { Alert } from '@/components/ui/alert';
import { fadeUp, stagger } from '@/shared/lib/motion';

const field =
  'h-11 w-full rounded-[var(--radius-cards)] border border-black/[0.1] bg-snow px-3 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:border-white/[0.1]';

export default function NewServicePage() {
  const router = useRouter();
  const create = useCreateSession();
  const [title, setTitle] = useState('');
  // ponytail: native date input — no picker lib for one field.
  const [date, setDate] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    create.mutate(
      { title: title.trim(), date: new Date(date).toISOString() },
      { onSuccess: (s) => router.push(`/dashboard/attendance/${s.id}`) },
    );
  };

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[560px]"
    >
      <BackLink href="/dashboard/attendance" label="Attendance" />
      <PageHeader
        title={
          <>
            New <Emph>service</Emph>
          </>
        }
        description="Name the gathering and pick its date. You'll mark who attended next."
      />

      <motion.form variants={fadeUp} onSubmit={submit} className="mt-8 space-y-5">
        {create.error ? <Alert>{create.error.message}</Alert> : null}

        <div className="space-y-1.5">
          <label htmlFor="title" className="text-[13px] text-muted-foreground">
            Title
          </label>
          <input
            id="title"
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunday · Main service"
            maxLength={200}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="date" className="text-[13px] text-muted-foreground">
            Date
          </label>
          <input
            id="date"
            type="date"
            className={field}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create service'}
        </Button>
      </motion.form>
    </motion.div>
  );
}
