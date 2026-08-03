'use client';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { exportDate, type ExportColumn } from '@/shared/lib/export';
import { formatMinor } from '@/shared/lib/money';
import { methodLabel, type DonationListItem } from '@/types/giving';

function entryState(d: DonationListItem): string {
  if (d.isReversal) return 'Correction';
  return d.reversed ? 'Reversed' : 'Posted';
}

export const donationExportColumns: ExportColumn<DonationListItem>[] = [
  { header: 'Date', value: (d) => exportDate(d.givenAt) },
  { header: 'Donor', value: (d) => d.donor ?? 'Anonymous' },
  { header: 'Fund', value: (d) => d.fund },
  { header: 'Method', value: (d) => methodLabel[d.method] },
  { header: 'Entry', value: (d) => entryState(d) },
  { header: 'Reference', value: (d) => d.reference },
  // Major units so the spreadsheet can sum the column; currency rides alongside.
  { header: 'Amount', value: (d) => d.amountMinor / 100 },
  { header: 'Currency', value: (d) => d.currency },
];

interface Props {
  donations: DonationListItem[];
  onReverse?: (id: string) => void;
  /** Id currently being reversed — disables just that row's button. */
  reversingId?: string | null;
}

export function ContributionsTable({
  donations,
  onReverse,
  reversingId,
}: Props) {
  const columns: Column<DonationListItem>[] = [
    {
      key: 'givenAt',
      header: 'Date',
      cell: (d) => (
        <span className="text-[12px] text-muted-foreground">
          {formatDate(d.givenAt)}
        </span>
      ),
    },
    {
      key: 'donor',
      header: 'Donor',
      cell: (d) => (
        <span
          className={
            d.donor
              ? 'text-[14px] font-medium text-foreground'
              : 'text-[14px] text-muted-foreground'
          }
        >
          {d.donor ?? 'Anonymous'}
        </span>
      ),
    },
    { key: 'fund', header: 'Fund', cell: (d) => d.fund },
    {
      key: 'method',
      header: 'Method',
      className: 'hidden md:table-cell',
      cell: (d) => (
        <span className="text-muted-foreground">{methodLabel[d.method]}</span>
      ),
    },
    {
      key: 'state',
      header: 'Entry',
      className: 'hidden lg:table-cell',
      cell: (d) =>
        d.isReversal ? (
          <StatusBadge tone="info">Correction</StatusBadge>
        ) : d.reversed ? (
          <StatusBadge tone="danger">Reversed</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Posted</StatusBadge>
        ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (d) => (
        <span
          className={
            d.amountMinor < 0
              ? 'font-display text-[15px] text-destructive'
              : 'font-display text-[15px] text-foreground'
          }
        >
          {formatMinor(d.amountMinor, d.currency)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (d) =>
        // Only a live, original entry can be corrected.
        onReverse && !d.isReversal && !d.reversed ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={reversingId === d.id}
            onClick={() => onReverse(d.id)}
          >
            {reversingId === d.id ? 'Reversing…' : 'Reverse'}
          </Button>
        ) : null,
    },
  ];

  return <DataTable data={donations} columns={columns} rowKey={(d) => d.id} />;
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
