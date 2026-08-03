'use client';

import { FiLock } from 'react-icons/fi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { exportDate, type ExportColumn } from '@/shared/lib/export';
import { careTypeLabel, type CareNoteListItem } from '@/types/care';

export const careNoteExportColumns: ExportColumn<CareNoteListItem>[] = [
  { header: 'Logged', value: (n) => exportDate(n.createdAt) },
  { header: 'Member', value: (n) => n.memberName },
  { header: 'Type', value: (n) => careTypeLabel[n.type] },
  { header: 'Note', value: (n) => n.excerpt },
  { header: 'Logged by', value: (n) => n.authorName },
  { header: 'Confidential', value: (n) => (n.confidential ? 'Yes' : 'No') },
  { header: 'Follow-up', value: (n) => exportDate(n.followUpAt) },
  {
    header: 'Follow-up state',
    value: (n) =>
      n.resolvedAt ? 'Resolved' : n.overdue ? 'Overdue' : n.followUpAt ? 'Open' : '',
  },
];

interface Props {
  notes: CareNoteListItem[];
  onResolve?: (id: string) => void;
  /** Id currently being resolved — disables just that row's button. */
  resolvingId?: string | null;
}

export function CareNotesTable({ notes, onResolve, resolvingId }: Props) {
  const columns: Column<CareNoteListItem>[] = [
    {
      key: 'member',
      header: 'Member',
      cell: (n) => (
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-foreground">
            {n.memberName}
          </span>
          {n.confidential ? (
            <FiLock
              size={12}
              className="shrink-0 text-pebble"
              aria-label="Confidential"
            />
          ) : null}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (n) => (
        <span className="text-muted-foreground">{careTypeLabel[n.type]}</span>
      ),
    },
    {
      key: 'excerpt',
      header: 'Note',
      className: 'hidden md:table-cell max-w-[320px]',
      cell: (n) => (
        <span className="line-clamp-1 text-muted-foreground">{n.excerpt}</span>
      ),
    },
    {
      key: 'author',
      header: 'Logged by',
      className: 'hidden lg:table-cell',
      cell: (n) => (
        <span className="text-muted-foreground">{n.authorName}</span>
      ),
    },
    {
      key: 'followUp',
      header: 'Follow-up',
      cell: (n) => <FollowUpCell note={n} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (n) =>
        onResolve && n.followUpAt && !n.resolvedAt ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={resolvingId === n.id}
            onClick={() => onResolve(n.id)}
          >
            {resolvingId === n.id ? 'Resolving…' : 'Resolve'}
          </Button>
        ) : null,
    },
  ];

  return <DataTable data={notes} columns={columns} rowKey={(n) => n.id} />;
}

function FollowUpCell({ note }: { note: CareNoteListItem }) {
  if (note.resolvedAt) {
    return <StatusBadge tone="success">Resolved</StatusBadge>;
  }
  if (!note.followUpAt) {
    return <span className="text-[12px] text-pebble">—</span>;
  }
  return (
    <StatusBadge tone={note.overdue ? 'danger' : 'warning'} dot>
      {note.overdue ? 'Overdue' : 'Due'} {formatDate(note.followUpAt)}
    </StatusBadge>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
