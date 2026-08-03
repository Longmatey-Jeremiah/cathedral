'use client';

import { useState } from 'react';
import { FiDownload, FiFileText, FiGrid } from 'react-icons/fi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  downloadCsv,
  downloadXlsx,
  exportFileName,
  type ExportColumn,
} from '@/shared/lib/export';

interface Props<Row> {
  /** Base file name, dated on download: `members` → `members-2026-08-02.csv`. */
  name: string;
  columns: ExportColumn<Row>[];
  /** Rows to export — async so a page can fetch beyond the visible page. */
  rows: () => Row[] | Promise<Row[]>;
  disabled?: boolean;
}

/** CSV / Excel download menu, dropped next to a list view's filters. */
export function ExportMenu<Row>({ name, columns, rows, disabled }: Props<Row>) {
  const [busy, setBusy] = useState(false);

  async function run(format: 'csv' | 'xlsx') {
    setBusy(true);
    try {
      const data = await rows();
      if (data.length === 0) {
        toast.info('Nothing to export');
        return;
      }
      const fileName = exportFileName(name);
      if (format === 'csv') downloadCsv(data, columns, fileName);
      else await downloadXlsx(data, columns, fileName);
    } catch {
      toast.error('Export failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled || busy}>
          <FiDownload size={14} aria-hidden />
          {busy ? 'Exporting…' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-44">
        <DropdownMenuItem className="gap-2" onSelect={() => run('csv')}>
          <FiFileText size={14} className="text-muted-foreground" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={() => run('xlsx')}>
          <FiGrid size={14} className="text-muted-foreground" />
          Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
