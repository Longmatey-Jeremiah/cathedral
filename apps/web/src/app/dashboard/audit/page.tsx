'use client';

import { motion } from 'framer-motion';
import { auditLog, timeAgo } from '@/features/audit/mock-data';
import { Emph } from '@/shared/components/Emph';
import { Avatar } from '@/shared/components/admin/Avatar';
import { DataTable, type Column } from '@/shared/components/admin/DataTable';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { stagger } from '@/shared/lib/motion';

type Entry = (typeof auditLog)[number];

export default function AuditPage() {
  const columns: Column<Entry>[] = [
    {
      key: 'actor',
      header: 'Actor',
      cell: (e) => (
        <div className="flex items-center gap-3">
          <Avatar name={e.actor} />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-foreground">
              {e.actor}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {e.actorRole}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      cell: (e) => (
        <div>
          <div className="text-[13px] text-foreground">
            <span className="text-muted-foreground">{e.verb}</span>{' '}
            <span>{e.target}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      className: 'hidden md:table-cell text-[12px] text-muted-foreground',
      cell: (e) => e.ip,
    },
    {
      key: 'at',
      header: 'When',
      align: 'right',
      className: 'text-[12px] text-muted-foreground',
      cell: (e) => timeAgo(e.at),
    },
  ];

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px]"
    >
      <PageHeader
        eyebrow="Append-only · immutable"
        title={
          <>
            <Emph>Audit</Emph> trail.
          </>
        }
        description="Every meaningful action — who did what, against what, and from where. Entries are immutable; they can be exported but never edited."
      />

      <div className="mt-8">
        <DataTable data={auditLog} columns={columns} rowKey={(e) => e.id} />
      </div>
    </motion.div>
  );
}
