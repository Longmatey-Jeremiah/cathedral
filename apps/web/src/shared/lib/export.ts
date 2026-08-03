/** CSV / Excel export shared by every list view. */

import type { SheetData } from 'write-excel-file/browser';

export interface ExportColumn<Row> {
  header: string;
  value: (row: Row) => string | number | null | undefined;
}

/** The API caps `pageSize` at 100, so an export walks pages. */
const PAGE_SIZE = 100;

/** Stop runaway loops if `total` ever disagrees with what the API returns. */
const MAX_PAGES = 200;

/**
 * Collect every page of a list endpoint so an export covers the whole result
 * set, not just the page on screen.
 *
 * ponytail: sequential requests — fine up to a few thousand rows. Move the
 * export server-side if a church ever outgrows that.
 */
export async function fetchAllPages<Row>(
  fetchPage: (
    page: number,
    pageSize: number,
  ) => Promise<{ data: Row[]; total: number }>,
): Promise<Row[]> {
  const first = await fetchPage(1, PAGE_SIZE);
  const rows = [...first.data];
  const pages = Math.min(Math.ceil(first.total / PAGE_SIZE), MAX_PAGES);
  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchPage(page, PAGE_SIZE);
    if (next.data.length === 0) break;
    rows.push(...next.data);
  }
  return rows;
}

function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /["\n\r,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<Row>(
  rows: Row[],
  columns: ExportColumn<Row>[],
): string {
  const lines = [columns.map((c) => csvCell(c.header)).join(',')];
  for (const row of rows) {
    lines.push(columns.map((c) => csvCell(c.value(row))).join(','));
  }
  return lines.join('\r\n');
}

/** ISO timestamps export as `2026-08-02` — sorts correctly in a spreadsheet. */
export function exportDate(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** `<name>-2026-08-02` — exports get dated so downloads don't collide. */
export function exportFileName(name: string): string {
  return `${name}-${new Date().toISOString().slice(0, 10)}`;
}

function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv<Row>(
  rows: Row[],
  columns: ExportColumn<Row>[],
  fileName: string,
): void {
  // Without the BOM Excel reads the file as Latin-1 and mangles accents / ₵.
  const blob = new Blob(['\uFEFF', toCsv(rows, columns)], {
    type: 'text/csv;charset=utf-8',
  });
  download(blob, `${fileName}.csv`);
}

export async function downloadXlsx<Row>(
  rows: Row[],
  columns: ExportColumn<Row>[],
  fileName: string,
): Promise<void> {
  // Loaded on click — the writer is a few hundred kB and no page needs it to render.
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const header = columns.map((c) => ({
    value: c.header,
    fontWeight: 'bold' as const,
  }));
  // Numbers stay numbers so the spreadsheet can sum them; everything else is text.
  const body = rows.map((row) =>
    columns.map((c) => {
      const value = c.value(row);
      if (value === null || value === undefined) return null;
      return typeof value === 'number'
        ? { value, type: Number }
        : { value: String(value), type: String };
    }),
  );
  const sheet: SheetData = [header, ...body];
  download(await writeXlsxFile(sheet).toBlob(), `${fileName}.xlsx`);
}
